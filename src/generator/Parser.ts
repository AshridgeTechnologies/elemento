import Element from '../model/Element'
import {globalFunctions} from '../runtime/globalFunctions'
import {appFunctionsNames} from '../runtime/appFunctions'
import {isExpr} from '../util/helpers'
import {ElementId, ElementType, EventActionPropertyDef, MultiplePropertyValue, PropertyDef, PropertyValue} from '../model/Types'
import {AllErrors, ElementErrors, ExprType, IdentifierCollector, ListItem, runtimeElementName, runtimeElementTypeName} from './Types'
import Project from '../model/Project'
import {allElements, functionInputs, valueLiteral} from './generatorHelpers'
import type UrlContext from '../runtime/UrlContext'
import {AppData} from '../runtime/components/AppData'
import {elementOfType, elementTypeNames} from '../model/elements'
import {parseExpr, parseExprAndIdentifiers} from './parserHelpers'
import ComponentDef from '../model/ComponentDef'
import {mapValues} from 'radash'
import BaseElement from '../model/BaseElement'

const PageClass = elementOfType('Page')
type Page = typeof PageClass

const FunctionDefClass = elementOfType('Function')
type FunctionDef = typeof FunctionDefClass

type FunctionCollector = {add(s: string): void}
type ElementIdentifiers = {[elementId: ElementId]: string[]}
export type PropertyError = string | ElementErrors | undefined

const appFunctions = appFunctionsNames()
const appStateFunctions = Object.keys(new AppData({pages:{}, urlContext: null as unknown as UrlContext, themeOptions: {}})).filter(fnName => !['props', 'state', 'updateFrom'].includes(fnName))
const runtimeElementTypes = () => elementTypeNames().filter(key => key !== 'Function' && key !== 'FunctionImport').map( key => runtimeElementTypeName(key as ElementType))

export const isGlobalFunction = (name: string) => name in globalFunctions
export const isAppFunction = (name: string) => appFunctions.includes(name)
export const isAppStateFunction = (name: string) => appStateFunctions.includes(name)
const isComponent = (name: string) => runtimeElementTypes().includes(name)
const isSeparateComponent = (el: Element | ListItem) => el instanceof ListItem || ['App', 'Page', 'Form', 'Component'].includes(el.kind)
const isBuiltIn = (name: string) => ['undefined', 'null', 'Date', 'Math', 'JSON', 'window', 'document'].includes(name)
const isToolWindowGlobal = (name: string) => ['Editor', 'Preview'].includes(name)
const isItemVar = (name: string) => ['$item', '$itemId', '$index', '$selected'].includes(name)
const isDragFunction = (name: string) => ['DragIsOver', 'DraggedItem', 'DraggedItemId'].includes(name)
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

    dragFunctionIdentifiers(elementId: ElementId): string[] {
        return this.componentIdentifiers(elementId).filter(isDragFunction)
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

        const err = typeof error === 'string' ? error.replace(/'/g, '') : error
        this.errors[elementId][propertyName] = err
    }

    parseStandaloneExpr(exprId: string, exprs: {[name: string] : string}, containingComponent: Element) {
        const identifierSet = new Set<string>()
        this.errors[exprId] = {}
        const onError = (name: string) => (err: string) => this.addError(exprId, name, err)
        const allContainerElements = containingComponent ? allElements(containingComponent, true) : []
        const isDataTypes = (name: string) => this.project.dataTypes.some( el => el.codeName === name )
        const isServerApp = (name: string) => this.project.elementArray().some(el => el.kind === 'ServerApp' && el.codeName === name)
        const isAppElement = (name: string) => (this.globalScopeElement.elements ?? []).some(el => el.codeName === name)
        const isContainerElement = (name: string) => allContainerElements.some(el => el.codeName === name )
        const isInTool = this.globalScopeElement.kind === 'Tool'
        const isKnown = (name: string) => isGlobalFunction(name)
            || isDataTypes(name)
            || isAppFunction(name)
            || isAppStateFunction(name)
            || (/*componentIsListItem &&*/ (isItemVar(name) || isDragFunction(name))) //TODO allow $item only in ListItem and predicates
            || isServerApp(name)
            || isAppElement(name)
            || isContainerElement(name)
            || isBuiltIn(name)
            || (isInTool && isToolWindowGlobal(name))
            || name === '_selectedElement'
            || name === '_state'
        mapValues(exprs, (expr, name: string) => parseExprAndIdentifiers({expr}, identifierSet, isKnown, 'singleExpression', onError(name), false))
        this.identifiersForComponent[exprId] = Array.from(identifierSet.values())
    }

    parseComponent(component: Element | ListItem, containingComponent?: Page) {
        const identifierSet = new Set<string>()
        const componentIsForm = component.kind === 'Form'
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
            || (/*componentIsListItem &&*/ (isItemVar(name) || isDragFunction(name))) //TODO allow $item only in ListItem and predicates
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

        if (component instanceof ListItem) {
            const {itemSet} = component
            const stylesPropertyDef = itemSet.propertyDefs.find(def => def.name === 'itemStyles')!
            const stylesIdentifiers = this.parseStylesProperty(itemSet, stylesPropertyDef, isKnown)
            addAllTo(identifierSet, stylesIdentifiers)
            const canDragPropertyDef = itemSet.propertyDefs.find(def => def.name === 'canDragItem')!
            const canDragIdentifiers = this.parseProperty(itemSet, canDragPropertyDef, isKnown)
            addAllTo(identifierSet, canDragIdentifiers)
        }

        if (component.kind === 'App') {
            this.parseElement(component, identifierSet, topLevelFunctions, isKnown, containingComponent, false)
        }
        const elementArray = (component instanceof ListItem ? component.itemSet.elements : component.elements) ?? []
        elementArray.forEach(childEl => {
            this.parseElement(childEl, identifierSet, topLevelFunctions, isKnown, containingComponent)
        })

        this.identifiersForComponent[component.id] = Array.from(identifierSet.values())
    }

    private parseProperty(element: Element, def: PropertyDef, isKnown: (name: string) => boolean): Set<ElementId> {
        const propertyIdentifiers = new Set<ElementId>()
        const eventActionDef = def.type as EventActionPropertyDef
        const isAction = eventActionDef.type === 'Action'
        const exprType: ExprType = isAction ? 'action': def.multilineExpr ? 'multilineExpression' : 'singleExpression'
        const onError = (err: string) => this.addError(element.id, def.name, err)
        const isSpecialVar = (id: string) => def.name === 'keyAction' && id === '$key' || def.name === 'submitAction' && id === '$data'
        const isFunctionCalculation = element.kind === 'Function' && def.name === 'calculation'
        const isArgument = (id: string) => (isAction && eventActionDef.argumentNames.includes(id))
            || (isFunctionCalculation && functionInputs(element as FunctionDef).includes(id))
        const isKnownOrArgument = (name: string) => isKnown(name) || isSpecialVar(name) || isArgument(name)
        const isJavaScript = (isFunctionCalculation && (element as FunctionDef).javascript) ?? false

        const propertyValue = element.propertyValue(def.name) as PropertyValue | undefined
        parseExprAndIdentifiers(propertyValue, propertyIdentifiers, isKnownOrArgument, exprType, onError, isJavaScript)
        this.elementPropertyIdentifiers[element.id + '_' + def.name] = Array.from(propertyIdentifiers.values())
        return propertyIdentifiers
    }

    private parseStylesProperty (element: Element, def: PropertyDef, isKnown: (name: string) => boolean): Set<ElementId> {
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

    private parseStateProperties(element: Element, isKnown: (name: string) => boolean) {
        const elementIdentifiers = new Set<string>()

        switch (element.kind) {
            case 'Function': {
                const functionDef = element as FunctionDef
                const isKnownOrParam = (identifier: string) => isKnown(identifier) || functionInputs(functionDef).includes(identifier)
                const onError = (err: string) => this.addError(element.id, 'calculation', err)
                parseExprAndIdentifiers(functionDef.calculation, elementIdentifiers, isKnownOrParam, 'multilineExpression', onError, true)
                break
            }

            default: {
                this.project.propertyDefsOf(element).filter(({state}) => state).forEach(def => {
                    const propertyIdentifiers = this.parseProperty(element, def, isKnown)
                    addAllTo(elementIdentifiers, propertyIdentifiers)
                })
            }
        }

        this.stateEntryIdentifiers[element.id] = Array.from(elementIdentifiers.values())
        return elementIdentifiers
    }



    private parseNonStateProperties(element: Element, isKnown: (name: string) => boolean) {
        const elementIdentifiers = new Set<string>
        this.project.propertyDefsOf(element).filter( ({state}) => !state).forEach(def => {
            const propertyIdentifiers = def.type === 'styles' ? this.parseStylesProperty(element, def, isKnown) : this.parseProperty(element, def, isKnown)
            addAllTo(elementIdentifiers, propertyIdentifiers)
        })

        return elementIdentifiers
    }

    private parseElement(element: Element | ListItem, identifiers: IdentifierCollector, topLevelFunctions: FunctionCollector, isKnown: (name: string) => boolean, containingComponent?: Page, includeChildren = true) {

        const parseChildren = (element: Element | ListItem, containingComponent?: Page) => {
            const elementArray = (element instanceof ListItem ? element.itemSet.elements : element.elements) ?? []
            elementArray.forEach(childEl => {
                this.parseElement(childEl, identifiers, topLevelFunctions, isKnown, containingComponent)
            })
        }

        if (element instanceof ListItem) {
            parseChildren(element.itemSet)
            return
        }

        addAllTo(identifiers, this.parseStateProperties(element, isKnown))
        addAllTo(identifiers, this.parseNonStateProperties(element, isKnown))

        if (!isSeparateComponent(element)) {
            identifiers.add(runtimeElementName(element))
        }

        if (element.kind === 'Page') {
            this.parseComponent(element, element as Page)
        } else if (element.kind === 'Form') {
            this.parseComponent(element)
        } else if (element.kind === 'Component') {
            this.parseComponent(element)
        } else if (element.kind === 'ItemSet') {
            this.parseComponent(new ListItem(element as BaseElement<any>), containingComponent)
        } else if (element.kind === 'DataTypes') {
            this.parseComponent(element)
        } else if (includeChildren) {
            parseChildren(element, containingComponent)
        }
    }
}
