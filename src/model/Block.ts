import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'
import {pick} from 'radash'
import {equals} from 'ramda'

type Properties = Styling & Show

export default class Block extends BaseElement<Properties> implements Element {

    readonly kind = 'Block'
    get iconClass() { return 'widgets' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            ...visualPropertyDefs(),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
