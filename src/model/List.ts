import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, eventAction, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import {elementOfType} from './elements'

type Properties = {
    items?: PropertyValueType<any[]>, selectedItem?: PropertyValueType<any>,
    readonly style?: PropertyValueType<string>, readonly width?: PropertyValueType<string | number>,
    readonly selectable?: PropertyValueType<boolean>,
    readonly selectAction?: PropertyExpr
}

export default class List extends BaseElement<Properties> implements Element {

    static kind = 'List'
    static get iconClass() { return 'view_list' }
    type(): ComponentType { return 'statefulUI' }

    get items() { return this.properties.items }
    get selectedItem() { return this.properties.selectedItem }
    get width() { return this.properties.width }
    get selectable() { return this.properties.selectable }
    get selectAction() { return this.properties.selectAction }
    get style() { return this.properties.style }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('items', 'expr'),
            propDef('selectedItem', 'expr', {state: true}),
            propDef('width', 'string|number'),
            propDef('selectable', 'boolean'),
            propDef('selectAction', eventAction('$item')),
            propDef('style', 'string'),
        ]
    }

    canContain(elementType: ElementType) {
        return this.elementHasParentTypeOfThis(elementType)
    }


    private elementHasParentTypeOfThis(elementType: ElementType) {
        const parentType = elementOfType(elementType).parentType
        return parentType === this.kind || parentType === 'any'
    }
}