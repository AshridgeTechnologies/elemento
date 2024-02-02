import Topo from '@hapi/topo'
import lodash from 'lodash';
import Element from '../model/Element'
import {flatten, last} from 'ramda'
import List from '../model/List'
import {ExprType, ListItem} from './Types'
import Form from '../model/Form'
import {BaseApp} from '../model/BaseApp'
import {print, types} from 'recast'
import {functionArgs, globalFunctions} from '../runtime/globalFunctions'
import {visit} from 'ast-types'

const {isArray, isPlainObject} = lodash;

function safeKey(name: string) {
    return name.match(/\W/) ? `'${name}'` : name
}

export const quote = (s: string) => `'${s}'`

export function objectLiteralEntries(obj: object, suffixIfNotEmpty: string = '') {
    const entries = Object.entries(obj)
    return entries.length ? entries.map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ') + suffixIfNotEmpty : ''
}

export function objectLiteral(obj: object) {
    return `{${objectLiteralEntries(obj)}}`
}

export type StateEntry = [el: Element, code: string | DefinedFunction, dependencies: string[]]

export class DefinedFunction {
    constructor(public functionDef: string) {
    }
}

export const topoSort = (entries: StateEntry[]): StateEntry[] => {
    const sorter = new Topo.Sorter<StateEntry>()
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
        return propertyValue.includes('\n') ? `\`${propertyValue}\`` : `'${propertyValue.replace(/'/g, "\\'")}'`
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
        const childElements = component.list.elements || []
        return flatten(childElements.map(el => [el, allElements(el)]))
    }
    if (component instanceof List) {
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
export const knownSync = (functionName: string) => isGlobalFunction(functionName)

export function convertAstToValidJavaScript(ast: any, exprType: ExprType, asyncExprTypes: ExprType[]) {
    function isShorthandProperty(node: any) {
        return node.shorthand
    }

    function addReturnStatement(ast: any) {
        const bodyStatements = ast.program.body as any[]
        const lastStatement = last(bodyStatements)
        const b = types.builders
        ast.program.body[bodyStatements.length - 1] = b.returnStatement(lastStatement.expression)
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
                if (argNames === 'lazy') {
                    const argExpr = callExpr.arguments[index]
                    if (argExpr && !isPlainValue(argExpr)) {
                        const isAsync = containsAwait(argExpr)
                        callExpr.arguments[index] = b.arrowFunctionExpression.from({params: [], body: argExpr, async: isAsync})
                    }
                } else {
                    const argIdentifiers = argNames.map((name: string) => b.identifier(name))
                    const bodyExpr = callExpr.arguments[index] ?? b.nullLiteral()
                    callExpr.arguments[index] = b.arrowFunctionExpression(argIdentifiers, bodyExpr)
                }
            })
            this.traverse(path)
        }
    })

    if (exprType === 'multilineExpression') {
        addReturnStatement(ast)
    }
}
