import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = Partial<Readonly<{
    items: PropertyValueType<any[]>,
    selectedItem: PropertyValueType<any>,
    selectable: PropertyValueType<boolean>,
    selectAction: PropertyExpr
}>> & Styling & Show

export default class List extends BaseElement<Properties> implements Element {

    static kind = 'List'
    static get iconClass() { return 'view_list' }
    type(): ComponentType { return 'statefulUI' }

    get items() { return this.properties.items }
    get selectedItem() { return this.properties.selectedItem }
    get selectable() { return this.properties.selectable }
    get selectAction() { return this.properties.selectAction }
    get styles() { return this.properties.styles }
    get show() { return this.properties.show }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('items', 'expr'),
            propDef('selectedItem', 'expr', {state: true}),
            propDef('selectable', 'boolean'),
            propDef('selectAction', eventAction('$item')),
            propDef('show', 'boolean'),
            propDef('styles', 'styles'),
        ]
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'selectedItem'
        ])
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
