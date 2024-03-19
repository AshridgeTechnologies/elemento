import Element from '../model/Element'
import {appFunctionsNames, componentNames} from '../serverRuntime/names'
import {globalFunctions} from '../serverRuntime/globalFunctions'
import {isExpr} from '../util/helpers'
import {ElementId, EventActionPropertyDef, PropertyValue} from '../model/Types'
import FunctionDef from '../model/FunctionDef'
import {flatten, uniq} from 'ramda'
import {ExprType} from './Types'
import ServerApp from '../model/ServerApp'
import {valueLiteral} from './generatorHelpers'
import {dummyAppContext} from '../runtime/AppContext'
import {AppData} from '../runtime/components/AppData'
import {parseExpr, parseExprAndIdentifiers} from './parserHelpers'
import ComponentInstance from '../model/ComponentInstance'
import assert from 'assert'
type ElementErrors = {[propertyName: string]: string}
type AllErrors = {[elementId: ElementId]: ElementErrors}
type ElementIdentifiers = {[elementId: ElementId]: string[]}

const appStateFunctions = Object.keys(new AppData({pages:{}, appContext: dummyAppContext})).filter( fnName => !['props', 'state'].includes(fnName))
const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => appFunctionsNames().includes(name)
const isAppStateFunction = (name: string) => appStateFunctions.includes(name)
const isComponentType = (name: string) => componentNames().includes(name)
const isBuiltIn = (name: string) => ['undefined', 'null'].includes(name)
const isItemVar = (name: string) => name === '$item'

export default class ServerAppParser {
    private readonly errors: AllErrors
    private readonly identifiers: ElementIdentifiers

    constructor(private app: ServerApp) {
        this.identifiers = {} as ElementIdentifiers
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

    allGlobalFunctionIdentifiers() {
        return this.allIdentifiers().filter(isGlobalFunction)
    }

    allAppFunctionIdentifiers() {
        return this.allIdentifiers().filter(isAppFunction)
    }

    allComponentIdentifiers() {
        return this.allIdentifiers().filter(isComponentType)
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
        const element = this.app.findElement(elementId)!
        const propertyValue = element.propertyValue(propertyName) as PropertyValue | undefined
        if (propertyValue === undefined) {
            return undefined
        }
        return isExpr(propertyValue) ? propertyValue.expr.trim() : valueLiteral(propertyValue)
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

            assert(!(element instanceof ComponentInstance))
            element.propertyDefs.forEach(def => {
                const isActionCalculation = element instanceof FunctionDef && def.name === 'calculation' && element.action
                const isEventAction = (def.type as EventActionPropertyDef).type === 'Action'
                const exprType: ExprType = (isActionCalculation || isEventAction) ? 'action': 'multilineExpression'
                const onError = (err: string) => this.addError(element.id, def.name, err)
                const isJavaScript = (element.kind === 'Function' && def.name === 'calculation' && (element as FunctionDef).javascript) ?? false
                const propertyValue = element.propertyValue(def.name) as PropertyValue | undefined
                parseExprAndIdentifiers(propertyValue, identifierSet, isKnown, exprType, onError, isJavaScript)
            })

        if (isComponentType(element.kind)) {
            identifierSet.add(element.kind)
        }

        this.identifiers[element.id] = Array.from(identifierSet.values())
    }
}
