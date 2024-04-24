import Page from '../model/Page'
import Element from '../model/Element'
import {globalFunctions} from '../runtime/globalFunctions'
import {appFunctionsNames} from '../runtime/appFunctions'
import {isExpr} from '../util/helpers'
import {
    CombinedPropertyValue,
    ElementId,
    ElementType,
    EventActionPropertyDef,
    MultiplePropertyValue,
    PropertyDef,
    PropertyValue
} from '../model/Types'
import List from '../model/List'
import FunctionDef from '../model/FunctionDef'
import {AllErrors, ElementErrors, ExprType, IdentifierCollector, ListItem, runtimeElementName, runtimeElementTypeName} from './Types'
import Project from '../model/Project'
import {allElements, valueLiteral} from './generatorHelpers'
import type AppContext from '../runtime/AppContext'
import {AppData} from '../runtime/components/AppData'
import {elementTypeNames, elementTypes} from '../model/elements'
import Form from '../model/Form'
import {parseExpr, parseExprAndIdentifiers} from './parserHelpers'
import ComponentDef from '../model/ComponentDef'

type FunctionCollector = {add(s: string): void}
type ElementIdentifiers = {[elementId: ElementId]: string[]}
export type PropertyError = string | ElementErrors | undefined

const appFunctions = appFunctionsNames()
const appStateFunctions = Object.keys(new AppData({pages:{}, appContext: null as unknown as AppContext})).filter( fnName => !['props', 'state', 'updateFrom'].includes(fnName))
const runtimeElementTypes = () => elementTypeNames().filter(key => key !== 'Function' && key !== 'FunctionImport').map( key => runtimeElementTypeName(key as ElementType))

const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => appFunctions.includes(name)
const isAppStateFunction = (name: string) => appStateFunctions.includes(name)
const isComponent = (name: string) => runtimeElementTypes().includes(name)
const isSeparateComponent = (el: Element | ListItem) => el instanceof ListItem || ['App', 'Page', 'Form', 'Component'].includes(el.kind)
const isBuiltIn = (name: string) => ['undefined', 'null', 'Date', 'Math', 'JSON', 'window', 'document'].includes(name)
const isToolWindowGlobal = (name: string) => ['Editor', 'Preview'].includes(name)
const isItemVar = (name: string) => name === '$item'
const isFormVar = (name: string) => name === '$form'
const isPropsVar = (name: string) => name === 'props'

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

    propertyError(elementId: ElementId, propertyName: string): PropertyError {
        return this.errors[elementId]?.[propertyName]
    }

    allErrors() { return this.errors }

    componentIdentifiers(elementId: ElementId): string[] {
        return this.identifiersForComponent[elementId] || []
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

    getAst(propertyValue: PropertyValue | undefined): any {
        const expr = this.getExpression(propertyValue)
        if (expr === undefined) {
            return undefined
        }
        try {
            return parseExpr(expr)
        } catch (e: any) {
            console.warn('Error parsing expression', '"'+ expr + '"', e.message)
            return undefined
        }
    }

    getExpression(propertyValue: PropertyValue | undefined): string | undefined {
        if (propertyValue === undefined) {
            return undefined
        }

        const singlePropertyValue = propertyValue as PropertyValue
        if (isExpr(singlePropertyValue)) {
            return singlePropertyValue.expr.trim()
        }

        return valueLiteral(singlePropertyValue)
    }

    private addError(elementId: ElementId, propertyName: string, error: string | ElementErrors) {
        if (!(elementId in this.errors)) {
            this.errors[elementId] = {}
        }

        this.errors[elementId][propertyName] = error
    }

    parseComponent(component: Element | ListItem, containingComponent?: Page) {
        const identifierSet = new Set<string>()
        const componentIsForm = component instanceof Form
        const componentIsCompDef = component instanceof ComponentDef
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
            || (componentIsCompDef && isPropsVar(name))
            || isServerApp(name)
            || isAppElement(name)
            || isContainerElement(name)
            || isBuiltIn(name)
            || (isInTool && isToolWindowGlobal(name))

        if (!(component instanceof ListItem)) {
            identifierSet.add(runtimeElementName(component))
        }

        if (component.kind === 'App') {
            this.parseElement(component, identifierSet, topLevelFunctions, isKnown, containingComponent, false)
        }
        const elementArray = (component instanceof ListItem ? component.list.elements : component.elements) ?? []
        elementArray.forEach(childEl => {
            this.parseElement(childEl, identifierSet, topLevelFunctions, isKnown, containingComponent)
        })

        this.identifiersForComponent[component.id] = Array.from(identifierSet.values())
    }

    private parseElement(element: Element | ListItem, identifiers: IdentifierCollector, topLevelFunctions: FunctionCollector, isKnown: (name: string) => boolean, containingComponent?: Page, includeChildren = true) {

        const parseChildren = (element: Element | ListItem, containingComponent?: Page) => {
            const elementArray = (element instanceof ListItem ? element.list.elements : element.elements) ?? []
            elementArray.forEach(childEl => {
                this.parseElement(childEl, identifiers, topLevelFunctions, isKnown, containingComponent)
            })
        }

        const parseProperty = (element: Element, def: PropertyDef): Set<ElementId> => {
            const propertyIdentifiers = new Set<ElementId>()
            const eventActionDef = def.type as EventActionPropertyDef
            const isAction = eventActionDef.type === 'Action'
            const exprType: ExprType = isAction ? 'action': 'singleExpression'
            const onError = (err: string) => this.addError(element.id, def.name, err)
            const isSpecialVar = (id: string) => def.name === 'keyAction' && id === '$key' || def.name === 'submitAction' && id === '$data'
            const isArgument = (id: string) => isAction && eventActionDef.argumentNames.includes(id)
            const isKnownOrArgument = (name: string) => isKnown(name) || isSpecialVar(name) || isArgument(name)
            const isJavaScript = (element.kind === 'Function' && def.name === 'calculation' && (element as FunctionDef).javascript) ?? false

            const propertyValue = element.propertyValue(def.name) as PropertyValue | undefined
            parseExprAndIdentifiers(propertyValue, propertyIdentifiers, isKnownOrArgument, exprType, onError, isJavaScript)
            this.elementPropertyIdentifiers[element.id + '_' + def.name] = Array.from(propertyIdentifiers.values())
            return propertyIdentifiers
        }

        const parseStylesProperty = (element: Element, def: PropertyDef): Set<ElementId> => {
            const overallPropertyIdentifiers = new Set<ElementId>()
            const stylesPropertyValue = element.propertyValue(def.name) as MultiplePropertyValue | undefined
            if (stylesPropertyValue) {
                const errors: ElementErrors = {}
                Object.entries(stylesPropertyValue).forEach( ([name, propertyValue]) => {
                    const propertyIdentifiers = new Set<ElementId>()
                    const onError: (err: string) => void = (err: string) => errors[name] = err
                    parseExprAndIdentifiers(propertyValue, propertyIdentifiers, isKnown, 'singleExpression', onError, false)
                    addAllTo(overallPropertyIdentifiers, propertyIdentifiers)
                })
                if (Object.keys(errors).length > 0) {
                    this.addError(element.id, def.name, errors)
                }
            }


            this.elementPropertyIdentifiers[element.id + '_' + def.name] = Array.from(overallPropertyIdentifiers.values())
            return overallPropertyIdentifiers
        }

        const parseStateProperties = (element: Element) => {
            const elementIdentifiers = new Set<string>()

            switch (element.kind) {
                case 'Function': {
                    const functionDef = element as FunctionDef
                    const isKnownOrParam = (identifier: string) => isKnown(identifier) || functionDef.inputs.includes(identifier)
                    const onError = (err: string) => this.addError(element.id, 'calculation', err)
                    parseExprAndIdentifiers(functionDef.calculation, elementIdentifiers, isKnownOrParam, 'multilineExpression', onError, true)
                    break
                }

                default: {
                    this.project.propertyDefsOf(element).filter(({state}) => state).forEach(def => {
                        const propertyIdentifiers = parseProperty(element, def)
                        addAllTo(elementIdentifiers, propertyIdentifiers)
                    })
                }
            }

            this.stateEntryIdentifiers[element.id] = Array.from(elementIdentifiers.values())
            addAllTo(identifiers, elementIdentifiers)
        }

        const parseNonStateProperties = (element: Element) => {
            this.project.propertyDefsOf(element).filter( ({state}) => !state).forEach(def => {
                const propertyIdentifiers = def.type === 'styles' ? parseStylesProperty(element, def) : parseProperty(element, def)
                addAllTo(identifiers, propertyIdentifiers)
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
        } else if (element.kind === 'Component') {
            this.parseComponent(element)
        } else if (element.kind === 'List') {
            this.parseComponent(new ListItem(element as List), containingComponent)
        } else if (element.kind === 'DataTypes') {
            this.parseComponent(element)
        } else if (includeChildren) {
            parseChildren(element, containingComponent)
        }
    }
}
