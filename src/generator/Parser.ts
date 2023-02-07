import {parse} from 'recast'
import {visit,} from 'ast-types'

import App from '../model/App'
import Page from '../model/Page'
import Element from '../model/Element'
import {globalFunctions} from '../runtime/globalFunctions'
import {appFunctionsNames} from '../runtime/appFunctions'
import {isExpr} from '../util/helpers'
import {ElementId, ElementType, EventActionPropertyDef, PropertyValue} from '../model/Types'
import List from '../model/List'
import FunctionDef from '../model/FunctionDef'
import {last, without} from 'ramda'
import {allElements, ExprType, ListItem, runtimeElementName, runtimeElementTypeName} from './Types'
import Project from '../model/Project'
import {valueLiteral} from './generatorHelpers'
import type AppContext from '../runtime/AppContext'
import {AppData} from '../runtime/components/AppData'
import {elementTypes} from '../model/elements'

type IdentifierCollector = {add(s: string): void}
type FunctionCollector = {add(s: string): void}
type ElementErrors = {[propertyName: string]: string}
type AllErrors = {[elementId: ElementId]: ElementErrors}
type ElementIdentifiers = {[elementId: ElementId]: string[]}

const appFunctions = appFunctionsNames()
const appStateFunctions = Object.keys(new AppData({pages:{}, appContext: null as unknown as AppContext})).filter( fnName => !['props', 'state', 'updateFrom'].includes(fnName))
const runtimeElementTypes = () => Object.keys(elementTypes()).filter(key => key !== 'Function').map( key => runtimeElementTypeName(key as ElementType))

const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => appFunctions.includes(name)
const isAppStateFunction = (name: string) => appStateFunctions.includes(name)
const isComponent = (name: string) => runtimeElementTypes().includes(name)
const isBuiltIn = (name: string) => ['undefined', 'null'].includes(name)
const isItemVar = (name: string) => name === '$item'

function parseExpr(expr: string) {
    const exprToParse = expr.trim().startsWith('{') ? `(${expr})` : expr
    return parse(exprToParse)
}


export default class Parser {
    private readonly errors: AllErrors
    private readonly identifiers: ElementIdentifiers
    private readonly stateEntryIdentifiers: ElementIdentifiers
    constructor(private app: App, private project: Project) {
        this.identifiers = {} as ElementIdentifiers
        this.stateEntryIdentifiers = {} as ElementIdentifiers
        this.errors = {} as AllErrors
        this.init()
    }

    init() {
        this.app.pages.forEach( page => this.parseComponent(this.app, page))
        this.parseComponent(this.app, this.app)
    }

    propertyError(elementId: ElementId, propertyName: string): string | undefined {
        return this.errors[elementId]?.[propertyName]
    }

    allErrors() { return this.errors }

    elementIdentifiers(elementId: ElementId): string[] {
        return this.identifiers[elementId]
    }

    appStateFunctionIdentifiers(elementId: ElementId) {
        return this.elementIdentifiers(elementId).filter(isAppStateFunction)
    }

    globalFunctionIdentifiers(elementId: ElementId) {
        return this.elementIdentifiers(elementId).filter(isGlobalFunction)
    }

    appFunctionIdentifiers(elementId: ElementId) {
        return this.elementIdentifiers(elementId).filter(isAppFunction)
    }

    identifiersOfTypeComponent(elementId: ElementId) {
        return this.elementIdentifiers(elementId).filter(isComponent)
    }

    stateIdentifiers(elementId: ElementId): string[] {
        return this.stateEntryIdentifiers[elementId]
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

    private addError(elementId: ElementId, propertyName: string, error: string) {
        if (!(elementId in this.errors)) {
            this.errors[elementId] = {}
        }

        this.errors[elementId][propertyName] = error
    }

    private parseComponent(app: App, component: Page | App | ListItem, containingComponent?: Page) {
        const componentIsPage = component instanceof Page
        const identifierSet = new Set<string>()
        const topLevelFunctions = new Set<string>()
        const allPages = app.pages
        const allComponentElements = allElements(component)
        const allContainerElements = containingComponent ? allElements(containingComponent) : []
        const isServerApp = (name: string) => this.project.elementArray().some(el => el.kind === 'ServerApp' && el.codeName === name)
        const isAppElement = (name: string) => app.otherComponents.some(el => el.codeName === name)
        const isComponentElement = (name: string) => !!allComponentElements.find(el => el.codeName === name )
        const isContainerElement = (name: string) => !!allContainerElements.find(el => el.codeName === name )
        const isPageName = (name: string) => !!allPages.find(p => p.codeName === name )
        const isKnown = (name: string) => isGlobalFunction(name)
            || isAppFunction(name)
            || isAppStateFunction(name)
            || isComponentElement(name)
            || isPageName(name)
            || (/*componentIsListItem &&*/ isItemVar(name)) //TODO allow $item only in ListItem and predicates
            || isServerApp(name)
            || isAppElement(name)
            || isContainerElement(name)
            || isBuiltIn(name)
        this.parseElement(component, app, identifierSet, topLevelFunctions, isKnown, componentIsPage ? containingComponent : undefined)

        this.identifiers[component.id] = Array.from(identifierSet.values())
    }

    private parseElement(element: Element | ListItem, app: App, identifiers: IdentifierCollector, topLevelFunctions: FunctionCollector, isKnown: (name: string) => boolean, containingComponent?: Page) {

        const parseChildren = (element: Element, containingComponent?: Page) => {
            const elementArray = element.elements ?? []
            elementArray.forEach(p => this.parseElement(p, app, identifiers, topLevelFunctions, isKnown, containingComponent))
        }

        const parseProperties = (element: Element) => {
            element.propertyDefs.forEach(def => {
                const exprType: ExprType = (def.type as EventActionPropertyDef).type === 'Action' ? 'action': 'singleExpression'
                this.parseExprAndIdentifiers(element, def.name, identifiers, isKnown, exprType)
            })
        }

        if (element instanceof ListItem) {
            parseChildren(element.list)
            return
         }

        this.parseStateProperties(element, isKnown)

        identifiers.add(runtimeElementName(element))

        switch (element.kind) {
            case 'App': {
                const app = element as App
                app.topChildren.forEach(p => this.parseElement(p, app, identifiers, topLevelFunctions, isKnown))
                app.bottomChildren.forEach(p => this.parseElement(p, app, identifiers, topLevelFunctions, isKnown))
                parseProperties(element)
                return
            }

            case 'Page': {
                const page = element as Page
                identifiers.add('Page')
                parseChildren(page, page)
                return
            }

            case 'List': {
                const list = element as List
                this.parseComponent(app, new ListItem(list), containingComponent)
                parseProperties(element)
                return
            }

            case 'Function': {
                const functionDef = element as FunctionDef
                const isKnownOrParam = (identifier: string) => isKnown(identifier) || functionDef.inputs.includes(identifier)
                this.parseExprAndIdentifiers(functionDef, 'calculation', identifiers, isKnownOrParam, 'multilineExpression')
                return
            }

            default:
                parseProperties(element)
                parseChildren(element, containingComponent)
        }

    }

    private parseStateProperties(element: Element, isKnown: (name: string) => boolean): void {
        const identifiers = new Set<string>()

        switch (element.kind) {
            case 'Function': {
                const functionDef = element as FunctionDef
                const isKnownOrParam = (identifier: string) => isKnown(identifier) || functionDef.inputs.includes(identifier)
                this.parseExprAndIdentifiers(functionDef, 'calculation', identifiers, isKnownOrParam, 'multilineExpression')
                break
            }

            default: {
                element.propertyDefs.filter( ({state}) => state).forEach(def => this.parseExprAndIdentifiers(element, def.name, identifiers, isKnown))
            }
        }

        this.stateEntryIdentifiers[element.id] = Array.from(identifiers.values())
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