import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

const layoutChoices = ['vertical', 'horizontal', 'horizontal wrapped', 'positioned', 'none'] as const
export type BlockLayout = typeof layoutChoices[number]
type Properties = {layout?: BlockLayout} & Styling & Show

export default class Block extends BaseElement<Properties> implements Element {

    readonly kind = 'Block'
    get iconClass() { return 'widgets' }
    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get layout() { return this.properties.layout ?? 'vertical' }
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('layout', layoutChoices),
            ...visualPropertyDefs(),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
