import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, eventAction, PropertyDef, PropertyExpr, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

export const blockLayoutChoices = ['vertical', 'horizontal', 'horizontal wrapped', 'positioned', 'none'] as const
export type BlockLayout = typeof blockLayoutChoices[number]
type Properties = Partial<Readonly<{layout: BlockLayout, dropAction: PropertyExpr}>> & Styling & Show

export default class Block extends BaseElement<Properties> implements Element {

    readonly kind = 'Block'
    get iconClass() { return 'widgets' }
    type(): ComponentType { return 'statefulUI' }
    isLayoutOnly() { return true }

    get layout() { return this.properties.layout ?? 'vertical' }
    get dropAction() {return this.properties.dropAction}
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('layout', blockLayoutChoices),
            propDef('dropAction', eventAction('$item', '$itemId', '$droppedOnItem', '$droppedOnItemId')),
            ...visualPropertyDefs(),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
