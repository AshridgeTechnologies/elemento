import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, StylingProps} from './Types'
import {elementHasParentTypeOf} from './createElement'

const selectableChoices = ['none', 'single', 'multiple', 'multipleAuto'] as const
type Selectable = typeof selectableChoices[number]

type Properties = Partial<Readonly<{
    items: PropertyValueType<any[]>,
    selectedItems: PropertyValueType<any>,
    selectable: PropertyValueType<Selectable>,
    selectAction: PropertyExpr,
    itemStyles: StylingProps
}>>

export default class ItemSet extends BaseElement<Properties> implements Element {

    readonly kind = 'ItemSet'
    get iconClass() { return 'list_alt' }
    type(): ComponentType { return 'statefulUI' }

    get items() { return this.properties.items }
    get selectedItems() { return this.properties.selectedItems }
    get selectable() { return this.properties.selectable }
    get selectAction() { return this.properties.selectAction }
    get itemStyles() { return this.properties.itemStyles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('items', 'expr', {state: true}),
            propDef('selectedItems', 'expr', {state: true}),
            propDef('selectable', selectableChoices, {state: true}),
            propDef('selectAction', eventAction('$item', '$itemId'), {state: true}),
            propDef('itemStyles', 'styles')
        ]
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'items', 'selectable', 'selectedItems', 'selectedItem'
        ])
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
