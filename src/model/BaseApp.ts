import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {
    ComponentType,
    ElementType,
    eventAction,
    ParentType,
    PropertyDef,
    PropertyExpr,
    PropertyValueType
} from './Types'
import {without} from 'ramda'
import Page from './Page'

export type Properties = Partial<Readonly<{
    author: PropertyValueType<string>,
    maxWidth: PropertyValueType<string | number>,
    startupAction: PropertyExpr
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
    get startupAction() {
        return this.properties.startupAction
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('author', 'string'),
            propDef('maxWidth', 'string|number'),
            propDef('startupAction', eventAction()),
        ]
    }

    protected appCanContain(elementType: ElementType, parentType: ParentType) {
        return parentType === 'App' ||
            parentType === this.kind || // to cover element types that extend App
            ['Collection', 'Function', 'FunctionImport', 'Component'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }

}
