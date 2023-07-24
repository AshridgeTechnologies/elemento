import BaseElement from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyValueType} from './Types'
import {without} from 'ramda'
import Page from './Page'

type Properties = { author?: PropertyValueType<string>, maxWidth?: PropertyValueType<string | number> }

export class BaseApp extends BaseElement<Properties> implements Element {

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

    get propertyDefs(): PropertyDef[] {
        return [
            {name: 'author', type: 'string'},
            {name: 'maxWidth', type: 'string|number'},
        ]
    }

    protected appCanContain(elementType: ElementType, parentType: ParentType) {
        return parentType === 'App' ||
            parentType === this.kind || // to cover element types that extend App
            ['Collection', 'Function', 'FunctionImport'].includes(elementType)
    }

    static get parentType(): ParentType {
        return 'Project'
    }

}
