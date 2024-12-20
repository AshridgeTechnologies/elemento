import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, eventAction, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import {without} from 'ramda'
import Page from './Page'
import {isArray} from 'lodash'

export type Properties = Partial<Readonly<{
    author: PropertyValueType<string>,
    maxWidth: PropertyValueType<string | number>,
    fonts: string,
    startupAction: PropertyExpr,
    messageAction: PropertyExpr,
    cookieMessage: PropertyValueType<string>
    faviconUrl: PropertyValueType<string>
    themeOptions: PropertyExpr
}>>

export abstract class BaseApp<PropsType extends Properties = Properties> extends BaseElement<PropsType> implements Element {

    type(): ComponentType {
        return 'app'
    }

    get pages() {
        return this.findChildElements<Page>('Page') // to keep TS typing happy
    }

    get otherComponents() {
        return without(this.pages, this.elementArray())
    }

    get topChildren() {
        return this.otherComponents.filter(el => el.kind === 'AppBar')
    }

    get bottomChildren() {
        return without(this.topChildren, this.otherComponents)
    }

    get author() {
        return this.properties.author
    }

    get maxWidth() {
        return this.properties.maxWidth
    }
    get fonts() { return this.properties.fonts }
    get fontList() {
        return (this.fonts ?? '').split(/\n+/).filter( line => !!line.trim())
    }
    get startupAction() {
        return this.properties.startupAction
    }
    get messageAction() {
        return this.properties.messageAction
    }
    get cookieMessage() {
        return this.properties.cookieMessage
    }
    get faviconUrl() {
        return this.properties.faviconUrl
    }
    get themeOptions() {
        return this.properties.themeOptions
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('author', 'string', {fixedOnly: true}),
            propDef('maxWidth', 'string|number'),
            propDef('fonts', 'string multiline', {fixedOnly: true}),
            propDef('startupAction', eventAction()),
            propDef('messageAction', eventAction('$sender', '$message')),
            propDef('cookieMessage', 'string'),
            propDef('faviconUrl', 'string'),
            propDef('themeOptions', 'expr', {state: true}),
        ]
    }

    protected appCanContain(elementType: ElementType, parentType: ParentType) {
        const canBeChild = (type: ParentType) => type === 'App' || type === this.kind
        return canBeChild(parentType) || isArray(parentType) && parentType.some(canBeChild) ||
            ['Collection', 'Function', 'FunctionImport', 'Component'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }
}
