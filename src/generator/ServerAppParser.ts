import {parse} from 'recast'
import {visit,} from 'ast-types'
import Element from '../model/Element'
import {componentNames} from '../serverRuntime/names'
import {globalFunctions} from '../serverRuntime/globalFunctions'
import {appFunctionsNames} from '../serverRuntime/appFunctions'
import {isExpr} from '../util/helpers'
import {ElementId, PropertyValue} from '../model/Types'
import FunctionDef from '../model/FunctionDef'
import {flatten, last, uniq, without} from 'ramda'
import {AppData} from '../runtime/components/App'
import {ExprType} from './Types'
import ServerApp from '../model/ServerApp'
import {valueLiteral} from './generatorHelpers'

type IdentifierCollector = {add(s: string): void}
type ElementErrors = {[propertyName: string]: string}
type AllErrors = {[elementId: ElementId]: ElementErrors}
type ElementIdentifiers = {[elementId: ElementId]: string[]}

const appStateFunctions = Object.keys(new AppData({pages:{}})).filter( fnName => !['props', 'state'].includes(fnName))
const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => appFunctionsNames().includes(name)
const isAppStateFunction = (name: string) => appStateFunctions.includes(name)
const isComponentType = (name: string) => componentNames().includes(name)
const isBuiltIn = (name: string) => ['undefined', 'null'].includes(name)
const isItemVar = (name: string) => name === '$item'

function parseExpr(expr: string) {
    const exprToParse = expr.trim().startsWith('{') ? `(${expr})` : expr
    return parse(exprToParse)
}

export default class ServerAppParser {
    private errors: AllErrors
    private identifiers: ElementIdentifiers
    private stateEntryIdentifiers: ElementIdentifiers
    constructor(private app: ServerApp) {
        this.identifiers = {} as ElementIdentifiers
        this.stateEntryIdentifiers = {} as ElementIdentifiers
        this.errors = {} as AllErrors
        this.init()
    }

    init() {
        const elements = this.app.elementArray() as FunctionDef[]
        elements.forEach(el => this.parseElement(el))
    }

    propertyError(elementId: ElementId, propertyName: string): string | undefined {
        return this.errors[elementId]?.[propertyName]
    }

    allErrors() { return this.errors }

    elementIdentifiers(elementId: ElementId): string[] {
        return this.identifiers[elementId]
    }

    globalFunctionIdentifiers(elementId: ElementId) {
        return this.elementIdentifiers(elementId).filter(isGlobalFunction)
    }

    allGlobalFunctionIdentifiers() {
        return this.allIdentifiers().filter(isGlobalFunction)
    }

    allAppFunctionIdentifiers() {
        return this.allIdentifiers().filter(isAppFunction)
    }

    allComponentIdentifiers() {
        return this.allIdentifiers().filter(isComponentType)
    }

    getExpression(elementId: ElementId, propertyName: string): any {
        const element = this.app.findElement(elementId)!
        const propertyValue: PropertyValue | undefined = element[propertyName as keyof Element] as PropertyValue | undefined
        if (propertyValue === undefined) {
            return undefined
        }
        if (isExpr(propertyValue)) {
            const {expr} = propertyValue
            return expr.trim()
        } else {
            return valueLiteral(propertyValue)
        }
    }

    getAst(elementId: ElementId, propertyName: string): any {
        const expr = this.getExpression(elementId, propertyName)
        if (expr === undefined) {
            return undefined
        }
        return parseExpr(expr)
    }

    private allIdentifiers() {
        return uniq(flatten(Array.from(Object.values(this.identifiers))))
    }

    private addError(elementId: ElementId, propertyName: string, error: string) {
        if (!(elementId in this.errors)) {
            this.errors[elementId] = {}
        }

        this.errors[elementId][propertyName] = error
    }

    private parseElement(element: Element) {
        const identifierSet = new Set<string>()
        const isAppElement = (name: string) => this.app.elementArray().some(el => el.codeName === name)
        const isParam = (name: string) => element instanceof FunctionDef && element.inputs.includes(name)
        const isKnown = (name: string) => isGlobalFunction(name)
            || isAppFunction(name)
            || isAppStateFunction(name)
            || isBuiltIn(name)
            || isAppElement(name)
            || isParam(name)
            || isItemVar(name)

            element.propertyDefs.forEach(def => {
                const isActionCalculation = element instanceof FunctionDef && def.name === 'calculation' && element.action
                const exprType: ExprType = (isActionCalculation || def.type === 'action') ? 'action': 'singleExpression'
                this.parseExprAndIdentifiers(element, def.name, identifierSet, isKnown, exprType)
            })

        if (isComponentType(element.kind)) {
            identifierSet.add(element.kind)
        }

        this.identifiers[element.id] = Array.from(identifierSet.values())
    }

    private parseExprAndIdentifiers(element: Element, propertyName: string, identifiers: IdentifierCollector,
        isKnown: (name: string) => boolean, exprType: ExprType = 'singleExpression'): void {

        const onError = (err: string) => this.addError(element.id, propertyName, err)
        const propertyValue: PropertyValue | undefined = element[propertyName as keyof Element] as PropertyValue | undefined
        if (propertyValue === undefined) {
            return undefined
        }

        function checkIsExpression(ast: any) {
            const bodyStatements = ast.program.body as any[]
            if (exprType === 'singleExpression') {
                if (bodyStatements.length !== 1) {
                    throw new Error('Must be a single expression')
                }
                const mainStatement = bodyStatements[0]
                if (mainStatement.type !== 'ExpressionStatement') {
                    throw new Error('Invalid expression')
                }
            }

            if (exprType === 'multilineExpression') {
                const lastStatement = last(bodyStatements)
                if (lastStatement.type !== 'ExpressionStatement') {
                    throw new Error('Invalid expression')
                }
            }
        }

        function checkErrors(ast: any) {
            if (ast.program.errors?.length) {
                throw new Error(ast.program.errors[0].description)
            }
        }

        function isShorthandProperty(node: any) {
            return node.shorthand
        }
        if (isExpr(propertyValue)) {
            const {expr} = propertyValue
            try {
                const ast = parseExpr(expr)
                checkIsExpression(ast)
                checkErrors(ast)
                const thisIdentifiers = new Set<string>()
                const variableIdentifiers = new Set<string>()
                visit(ast, {
                    visitVariableDeclarator(path) {
                        const node = path.value
                        variableIdentifiers.add(node.id.name)
                        this.traverse(path)
                    },
                    visitIdentifier(path) {
                        const node = path.value
                        const parentNode = path.parentPath.value
                        const isPropertyIdentifier = parentNode.type === 'MemberExpression' && parentNode.property === node
                        const isPropertyKey = parentNode.type === 'Property' && parentNode.key === node
                        const isVariableDeclaration = parentNode.type === 'VariableDeclarator' && parentNode.id === node
                        if (!isPropertyIdentifier && !isPropertyKey && !isVariableDeclaration) {
                            thisIdentifiers.add(node.name)
                        }
                        this.traverse(path)
                    },
                    visitProperty(path) {
                        const node = path.value
                        if (isShorthandProperty(node)) {
                            node.value.name = 'undefined'
                            const errorMessage = `Incomplete item: ${node.key.name}`
                            onError(errorMessage)
                        }
                        this.traverse(path)
                    },

                })

                const identifierNames = Array.from(thisIdentifiers.values())
                const isLocal = (id: string) => variableIdentifiers.has(id)
                const unknownIdentifiers = identifierNames.filter(id => !isKnown(id) && !isLocal(id))
                if (unknownIdentifiers.length) {
                    const errorMessage = `Unknown names: ${unknownIdentifiers.join(', ')}`
                    onError(errorMessage)
                }

                const externalIdentifiers = without(Array.from(variableIdentifiers), identifierNames)
                externalIdentifiers.forEach(name => identifiers.add(name))
            } catch(e: any) {
                const errorMessage = `${e.constructor.name}: ${e.message}`
                onError(errorMessage)
            }
        }
    }

}