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
    cookieMessage: PropertyValueType<string>
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
    get cookieMessage() {
        return this.properties.cookieMessage
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('author', 'string', {fixedOnly: true}),
            propDef('maxWidth', 'string|number'),
            propDef('fonts', 'string multiline', {fixedOnly: true}),
            propDef('startupAction', eventAction()),
            propDef('cookieMessage', 'string'),
        ]
    }

    protected appCanContain(elementType: ElementType, parentType: ParentType) {
        const canBeChild = (type: ParentType) => type === 'App' || type === this.kind
        return canBeChild(parentType) || isArray(parentType) && parentType.some(canBeChild) ||
            ['Collection', 'Function', 'FunctionImport', 'Component'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }
}
