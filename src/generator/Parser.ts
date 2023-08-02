import {parse} from 'recast'
import {visit,} from 'ast-types'
import Page from '../model/Page'
import Element from '../model/Element'
import {globalFunctions} from '../runtime/globalFunctions'
import {appFunctionsNames} from '../runtime/appFunctions'
import {isExpr} from '../util/helpers'
import {ElementId, ElementType, EventActionPropertyDef, PropertyDef, PropertyValue} from '../model/Types'
import List from '../model/List'
import FunctionDef from '../model/FunctionDef'
import {last, without} from 'ramda'
import {AllErrors, ExprType, ListItem, runtimeElementName, runtimeElementTypeName} from './Types'
import Project from '../model/Project'
import {allElements, valueLiteral} from './generatorHelpers'
import type AppContext from '../runtime/AppContext'
import {AppData} from '../runtime/components/AppData'
import {elementTypes} from '../model/elements'
import Form from '../model/Form'

type IdentifierCollector = {add(s: string): void}
type FunctionCollector = {add(s: string): void}
type ElementIdentifiers = {[elementId: ElementId]: string[]}

const appFunctions = appFunctionsNames()
const appStateFunctions = Object.keys(new AppData({pages:{}, appContext: null as unknown as AppContext})).filter( fnName => !['props', 'state', 'updateFrom'].includes(fnName))
const runtimeElementTypes = () => Object.keys(elementTypes()).filter(key => key !== 'Function' && key !== 'FunctionImport').map( key => runtimeElementTypeName(key as ElementType))

const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => appFunctions.includes(name)
const isAppStateFunction = (name: string) => appStateFunctions.includes(name)
const isComponent = (name: string) => runtimeElementTypes().includes(name)
const isSeparateComponent = (el: Element | ListItem) => el instanceof ListItem || ['App', 'Page', 'Form'].includes(el.kind)
const isBuiltIn = (name: string) => ['undefined', 'null', 'Date', 'Math'].includes(name)
const isToolWindowGlobal = (name: string) => ['Editor'].includes(name)
const isItemVar = (name: string) => name === '$item'
const isFormVar = (name: string) => name === '$form'

function parseExpr(expr: string) {
    const exprToParse = expr.trim().startsWith('{') ? `(${expr})` : expr
    return parse(exprToParse)
}

const addAllTo = (to: IdentifierCollector, from: Iterable<string>): void => {
    for( const item of from ) {
        to.add(item)
    }
}

export default class Parser {
    private readonly errors = {} as AllErrors
    private readonly identifiersForComponent = {} as ElementIdentifiers
    private readonly stateEntryIdentifiers = {} as ElementIdentifiers
    private readonly elementPropertyIdentifiers = {} as ElementIdentifiers
    constructor(private globalScopeElement: Element, private project: Project) {
    }

    propertyError(elementId: ElementId, propertyName: string): string | undefined {
        return this.errors[elementId]?.[propertyName]
    }

    allErrors() { return this.errors }

    componentIdentifiers(elementId: ElementId): string[] {
        return this.identifiersForComponent[elementId]
    }

    appStateFunctionIdentifiers(elementId: ElementId) {
        return this.componentIdentifiers(elementId).filter(isAppStateFunction)
    }

    globalFunctionIdentifiers(elementId: ElementId) {
        return this.componentIdentifiers(elementId).filter(isGlobalFunction)
    }

    appFunctionIdentifiers(elementId: ElementId) {
        return this.componentIdentifiers(elementId).filter(isAppFunction)
    }

    identifiersOfTypeComponent(elementId: ElementId) {
        return this.componentIdentifiers(elementId).filter(isComponent)
    }

    stateIdentifiers(elementId: ElementId): string[] {
        return this.stateEntryIdentifiers[elementId]
    }

    statePropertyIdentifiers(elementId: ElementId, propertyName: string): string[] {
        return this.elementPropertyIdentifiers[elementId + '_' + propertyName] ?? []
    }

    getAst(elementId: ElementId, propertyName: string): any {
        const expr = this.getExpression(elementId, propertyName)
        if (expr === undefined) {
            return undefined
        }
        try {
            return parseExpr(expr)
        } catch (e: any) {
            console.error('Error parsing expression', elementId, propertyName, '"'+ expr + '"', e.message)
            return undefined
        }
    }

    getExpression(elementId: ElementId, propertyName: string): any {
        const element = this.project.findElement(elementId)!
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

    private addError(elementId: ElementId, propertyName: string, error: string) {
        if (!(elementId in this.errors)) {
            this.errors[elementId] = {}
        }

        this.errors[elementId][propertyName] = error
    }

    parseComponent(component: Element | ListItem, containingComponent?: Page) {
        const identifierSet = new Set<string>()
        const componentIsPage = component instanceof Page
        const componentIsForm = component instanceof Form
        const topLevelFunctions = new Set<string>()
        const allComponentElements = allElements(component, true)
        const allContainerElements = containingComponent ? allElements(containingComponent, true) : []
        const isDataTypes = (name: string) => this.project.dataTypes.some( el => el.codeName === name )
        const isServerApp = (name: string) => this.project.elementArray().some(el => el.kind === 'ServerApp' && el.codeName === name)
        const isAppElement = (name: string) => (this.globalScopeElement.elements ?? []).some(el => el.codeName === name)
        const isComponentElement = (name: string) => allComponentElements.some(el => el.codeName === name )
        const isContainerElement = (name: string) => allContainerElements.some(el => el.codeName === name )
        const isInTool = this.globalScopeElement.kind === 'Tool'
        const isKnown = (name: string) => isGlobalFunction(name)
            || isDataTypes(name)
            || isAppFunction(name)
            || isAppStateFunction(name)
            || isComponentElement(name)
            || (/*componentIsListItem &&*/ isItemVar(name)) //TODO allow $item only in ListItem and predicates
            || (componentIsForm && isFormVar(name))
            || isServerApp(name)
            || isAppElement(name)
            || isContainerElement(name)
            || isBuiltIn(name)
            || (isInTool && isToolWindowGlobal(name))

        if (!(component instanceof ListItem)) {
            identifierSet.add(runtimeElementName(component))
        }

        const elementArray = (component instanceof ListItem ? component.list.elements : component.elements) ?? []
        elementArray.forEach(childEl => {
            this.parseElement(childEl, identifierSet, topLevelFunctions, isKnown, containingComponent)
        })

        this.identifiersForComponent[component.id] = Array.from(identifierSet.values())
    }

    private parseElement(element: Element | ListItem, identifiers: IdentifierCollector, topLevelFunctions: FunctionCollector, isKnown: (name: string) => boolean, containingComponent?: Page) {

        const parseChildren = (element: Element | ListItem, containingComponent?: Page) => {
            const elementArray = (element instanceof ListItem ? element.list.elements : element.elements) ?? []
            elementArray.forEach(childEl => {
                this.parseElement(childEl, identifiers, topLevelFunctions, isKnown, containingComponent)
            })
        }

        const parseProperty = (element: Element, def: PropertyDef): Set<ElementId> => {
            const propertyIdentifiers = new Set<ElementId>()
            const exprType: ExprType = (def.type as EventActionPropertyDef).type === 'Action' ? 'action': 'singleExpression'
            this.parseExprAndIdentifiers(element, def.name, propertyIdentifiers, isKnown, exprType)
            this.elementPropertyIdentifiers[element.id + '_' + def.name] = Array.from(propertyIdentifiers.values())
            return propertyIdentifiers
        }

        const parseStateProperties = (element: Element) => {
            const elementIdentifiers = new Set<string>()

            switch (element.kind) {
                case 'Function': {
                    const functionDef = element as FunctionDef
                    const isKnownOrParam = (identifier: string) => isKnown(identifier) || functionDef.inputs.includes(identifier)
                    this.parseExprAndIdentifiers(functionDef, 'calculation', elementIdentifiers, isKnownOrParam, 'multilineExpression')
                    break
                }

                default: {
                    element.propertyDefs.filter(({state}) => state).forEach(def => {
                        const propertyIdentifiers = parseProperty(element, def)
                        addAllTo(elementIdentifiers, propertyIdentifiers)
                    })
                }
            }

            this.stateEntryIdentifiers[element.id] = Array.from(elementIdentifiers.values())
            addAllTo(identifiers, elementIdentifiers)
        }

        const parseNonStateProperties = (element: Element) => {
            element.propertyDefs.filter( ({state}) => !state).forEach(def => {
                const propertyIdentifiers = parseProperty(element, def)
                propertyIdentifiers.forEach( val => identifiers.add(val))
            })
        }

        if (element instanceof ListItem) {
            parseChildren(element.list)
            return
         }

        parseStateProperties(element)
        parseNonStateProperties(element)

        if (!isSeparateComponent(element)) {
            identifiers.add(runtimeElementName(element))
        }

        if (element.kind === 'Page') {
            this.parseComponent(element, element as Page)
        } else if (element.kind === 'Form') {
            this.parseComponent(element)
        } else if (element.kind === 'List') {
            this.parseComponent(new ListItem(element as List), containingComponent)
        } else {
            parseChildren(element, containingComponent)
        }
    }

    private parseExprAndIdentifiers(element: Element, propertyName: string, identifiers: IdentifierCollector,
        isKnown: (name: string) => boolean, exprType: ExprType = 'singleExpression'): void {

        const onError = (err: string) => this.addError(element.id, propertyName, err)
        const propertyValue: PropertyValue | undefined = element[propertyName as keyof Element] as PropertyValue | undefined
        if (propertyValue === undefined) {
            return undefined
        }

        const isJavascriptFunctionBody = element.kind === 'Function' && propertyName === 'calculation' && (element as FunctionDef).javascript
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
                const exprToParse = isJavascriptFunctionBody ? `const x = function() {\n${expr}\n}` : expr
                const ast = parseExpr(exprToParse)

                if (!isJavascriptFunctionBody) {
                    checkIsExpression(ast)
                }
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
                const isSpecialVar = (id: string) => {
                    return propertyName === 'keyAction' && id === '$key'
                    || propertyName === 'submitAction' && id === '$data'
                }
                const isArgument = (id: string) => {
                    const def = element.getPropertyDef(propertyName)
                    const eventActionDef = def.type as EventActionPropertyDef
                    return eventActionDef.type === 'Action' && eventActionDef.argumentNames.includes(id)
                }
                const unknownIdentifiers = identifierNames.filter(id => !isKnown(id) && !isLocal(id) && !isSpecialVar(id) && !isArgument(id))
                if (unknownIdentifiers.length && !isJavascriptFunctionBody) {
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