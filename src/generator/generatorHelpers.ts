import Topo from '@hapi/topo'
import lodash from 'lodash';
import Element from '../model/Element'
import {flatten, last} from 'ramda'
import {ExprType, ListItem} from './Types'
import Form from '../model/Form'
import {BaseApp} from '../model/BaseApp'
import {print, types} from 'recast'
import {functionArgs, globalFunctions} from '../runtime/globalFunctions'
import {visit} from 'ast-types'
import FunctionDef from '../model/FunctionDef'
import ItemSet from '../model/ItemSet'
import {knownSyncAppFunctionsNames} from '../runtime/appFunctions'

const {isArray, isPlainObject} = lodash;

function safeKey(name: string) {
    return name.match(/\W/) ? `'${name}'` : name
}

export const quote = (s: string) => `'${s}'`
export function objectLiteral(obj: object) {
    const objectEntries = Object.entries(obj).map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ')
    return `{${objectEntries}}`
}

export type ObjectBuilderName = string | {fullName: string}
export function objectBuilder(name: ObjectBuilderName, obj: object, state = false) {
    const entries = Object.entries(obj)
    const builderFn = state ? 'stateProps' : 'elProps'
    const entriesCalls = entries.map(([name, val]) => `.${safeKey(name)}(${val})`).join('')
    const builderName = (name as {fullName: string}).fullName ?? `pathTo('${name}')`
    return `${builderFn}(${builderName})${entriesCalls}.props`
}

export type StateInitializer = [el: Element, code: string | FunctionDef, dependencies: string[]]

export const topoSort = (entries: StateInitializer[]): StateInitializer[] => {
    const sorter = new Topo.Sorter<StateInitializer>()
    entries.forEach(entry => {
        const [el, , dependencies] = entry
        sorter.add([entry], {after: dependencies, group: el.codeName})  // if add plain tuple, sorter treats it as an array
    })
    return sorter.nodes
}
export const valueLiteral = function (propertyValue: any): string {
    if (isPlainObject(propertyValue)) {
        return `{${Object.entries(propertyValue).map(([name, val]) => `${name}: ${valueLiteral(val)}`).join(', ')}}`
    } else if (isArray(propertyValue)) {
        return `[${propertyValue.map(valueLiteral).join(', ')}]`
    } else if (typeof propertyValue === 'string') {
        return propertyValue.includes('\n') ? `\`${propertyValue.replace(/\$/g, '\\$')}\`` : `'${propertyValue.replace(/'/g, "\\'")}'`
    } else if (propertyValue instanceof Date) {
        return `new Date('${propertyValue.toISOString()}')`
    } else {
        return String(propertyValue)
    }
}

export function isAppLike(component: Element | ListItem): component is BaseApp {
    return component instanceof BaseApp
}

export const allElements = (component: Element | ListItem, isTopLevel = false): Element[] => {
    if (isAppLike(component)) {
        return [component, ...flatten(component.otherComponents.map(el => [el, allElements(el)]))]
    }
    if (component instanceof ListItem) {
        const childElements = component.itemSet.elements || []
        return flatten(childElements.map(el => [el, allElements(el)]))
    }
    if (component instanceof ItemSet) {
        return []
    }

    if (component instanceof Form && !isTopLevel) {
        return []
    }

    const childElements = component.elements || []
    return flatten(childElements.map(el => [el, allElements(el)]))
}

export function printAst(ast: any) {
    return print(ast, {quote: 'single', objectCurlySpacing: false}).code.replace(/;$/, '')
}

export const indent = (codeBlock: string, indent: string) => codeBlock.split('\n').map(line => indent + line).join('\n')
export const isGlobalFunction = (name: string) => name in globalFunctions
export const knownSync = (functionName: string) => isGlobalFunction(functionName) || knownSyncAppFunctionsNames().includes(functionName)

export function convertAstToValidJavaScript(ast: any, exprType: ExprType, asyncExprTypes: ExprType[]) {
    function isShorthandProperty(node: any) {
        return node.shorthand
    }

    function addReturnStatement(ast: any) {
        const bodyStatements = ast.program.body as any[]
        if (bodyStatements.length !== 0) {
            const lastStatement = last(bodyStatements)
            const lastExpression = lastStatement.expression ?? null
            const b = types.builders
            ast.program.body[bodyStatements.length - 1] = b.returnStatement(lastExpression)
        }

    }

    function containsAwait(ast: any): boolean {
        let awaitFound = false
        visit(ast, {
            visitAwaitExpression(path) {
                awaitFound = true
                this.abort()
            }
        })

        return awaitFound
    }

    function addAwaitToAsyncFunctionCalls(ast: any) {
        visit(ast, {
            visitCallExpression(path) {
                const callExpr = path.value
                const b = types.builders
                if (asyncExprTypes.includes(exprType) && !knownSync(callExpr.callee.name)) {
                    const awaitExpr = b.awaitExpression(callExpr)
                    path.replace(awaitExpr)
                    this.traverse(path.get('argument')) // start one level down so don't parse this node again
                } else {
                    this.traverse(path)
                }
            }
        })
    }

    addAwaitToAsyncFunctionCalls(ast)

    visit(ast, {
        visitAssignmentExpression(path) {
            const node = path.value
            node.type = 'BinaryExpression'
            node.operator = '=='
            this.traverse(path)
        },

        visitProperty(path) {
            const node = path.value
            if (isShorthandProperty(node)) {
                node.value.name = 'undefined'
            }
            this.traverse(path)
        },

        visitCallExpression(path) {
            const callExpr = path.value
            const b = types.builders
            const functionName = callExpr.callee.name
            const argsCalledAsFunctions = functionArgs[functionName as keyof typeof functionArgs] ?? {}
            const isPlainValue = (expr: {type: string}) => expr.type === 'Identifier' || expr.type === 'Literal'
            Object.entries(argsCalledAsFunctions).forEach(([index, argNames]) => {
                const argIdentifiers = argNames === 'lazy' ? [] : argNames.map((name: string) => b.identifier(name))
                const argExpr = callExpr.arguments[index]
                if (argExpr && !isPlainValue(argExpr)) {
                    const isAsync = containsAwait(argExpr)
                    callExpr.arguments[index] = b.arrowFunctionExpression.from({params: argIdentifiers, body: argExpr, async: isAsync})
                }
            })
            this.traverse(path)
        }
    })

    if (exprType === 'multilineExpression') {
        addReturnStatement(ast)
    }
}
