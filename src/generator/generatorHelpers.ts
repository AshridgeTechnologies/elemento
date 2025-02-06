import Topo from '@hapi/topo'
import lodash, {startCase} from 'lodash'
import Element from '../model/Element'
import {flatten, identity, last} from 'ramda'
import {ExprType, ListItem} from './Types'
import Form from '../model/Form'
import {BaseApp} from '../model/BaseApp'
import {print, types} from 'recast'
import {functionArgs, globalFunctions} from '../runtime/globalFunctions'
import {visit} from 'ast-types'
import FunctionDef from '../model/FunctionDef'
import ItemSet from '../model/ItemSet'
import {knownSyncAppFunctionsNames} from '../runtime/appFunctions'
import {ElementId} from '../model/Types'

export type RequiredImports = {
    components: Set<string>,
    globalFunctions: Set<string>,
    appFunctions: Set<string>
}
export type GeneratedFile = {
    contents: string,
    requiredImports: RequiredImports,
}
const {isArray, isPlainObject} = lodash;

function safeKey(name: string) {
    return name.match(/\W/) ? `'${name}'` : name
}

export const quote = (s: string) => `'${s}'`

export function objectLiteral(obj: object) {
    const objectEntries = Object.entries(obj).map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ')
    return `{${objectEntries}}`
}

export type ObjectBuilderName = string | { fullName: string }

export function objectBuilder(name: ObjectBuilderName, obj: object, state = false) {
    const entries = Object.entries(obj)
    const builderFn = state ? 'stateProps' : 'elProps'
    const entriesCalls = entries.map(([name, val]) => `.${safeKey(name)}(${val})`).join('')
    const builderName = (name as { fullName: string }).fullName ?? `pathTo('${name}')`
    return `${builderFn}(${builderName})${entriesCalls}.props`
}

export type StateInitializer = [el: Element, code: string | FunctionDef, dependencies: string[]]

export class TopoSortError extends Error {
    readonly elementId: ElementId

    constructor(elementId: ElementId, message: string) {
        super(message)
        this.elementId = elementId
    }
}

export const topoSort = (entries: StateInitializer[]): StateInitializer[] => {
    const sorter = new Topo.Sorter<StateInitializer>()
    entries.forEach(entry => {
        const [el, , dependencies] = entry
        try {
            sorter.add([entry], {after: dependencies, group: el.codeName})  // if add plain tuple, sorter treats it as an array
        } catch (e: any) {
            const messageMatch = e.message.match(/item added into group (\S+) created a dependencies error/)
            if (messageMatch) {
                throw new TopoSortError(el.id, `Circular reference: this element uses another element which then uses this one.  The element is one of: ${dependencies.map(startCase).join(', ')}`)
            } else {
                throw e
            }
        }
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

export function generateDestructures(files: GeneratedFile[]) {
    const allComponents = new Set<string>
    const allGlobalFunctions = new Set<string>
    const allAppFunctions = new Set<string>

    for (let f of files) {
        f.requiredImports.components.forEach( name => allComponents.add(name) )
        f.requiredImports.globalFunctions.forEach( name => allGlobalFunctions.add(name) )
        f.requiredImports.appFunctions.forEach( name => allAppFunctions.add(name) )
    }

    const componentDestructures = allComponents.size ? `const {${Array.from(allComponents).join(', ')}} = Elemento.components` :''
    const globalFunctionDestructures = allGlobalFunctions.size ? `const {${Array.from(allGlobalFunctions).join(', ')}} = Elemento.globalFunctions` : ''
    const appFunctionDestructures = allAppFunctions.size ? `const {${Array.from(allAppFunctions).join(', ')}} = Elemento.appFunctions` : ''

    return [componentDestructures, globalFunctionDestructures, appFunctionDestructures].filter(identity).join('\n')
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
export const assumeAsync = ['If' /* because it can return anything including a promise */]
export const knownSync = (functionName: string) => !assumeAsync.includes(functionName) && (isGlobalFunction(functionName) || knownSyncAppFunctionsNames().includes(functionName))

export function convertAstToValidJavaScript(ast: any, exprType: ExprType, asyncExprTypes: ExprType[], knownSyncFunction: (fnName: string) => boolean) {
    const canBeAsync = asyncExprTypes.includes(exprType)

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
                if (canBeAsync && !knownSync(callExpr.callee.name) && !knownSyncFunction(callExpr.callee.name)) {
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
            const isPlainValue = (expr: { type: string }) => expr.type === 'Identifier' || expr.type === 'Literal'
            Object.entries(argsCalledAsFunctions).forEach(([index, argNames]) => {
                const isLazyEval = argNames === 'lazy'
                const argIdentifiers = isLazyEval ? [] : argNames.map((name: string) => b.identifier(name))
                const argExpr = callExpr.arguments[index]
                if (argExpr && !(isLazyEval && isPlainValue(argExpr))) {
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
