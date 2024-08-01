import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyValueType, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'
import {BlockLayout, blockLayoutChoices} from './Block'

type Properties = Partial<Readonly<{layout: BlockLayout, initiallyOpen: PropertyValueType<boolean>, showCloseButton: PropertyValueType<boolean>}>> & Styling

export default class Block extends BaseElement<Properties> implements Element {

    readonly kind = 'Dialog'
    get iconClass() { return 'table_view' }
    type(): ComponentType { return 'statefulUI' }

    get layout() { return this.properties.layout }
    get initiallyOpen() { return this.properties.initiallyOpen }
    get showCloseButton() { return this.properties.showCloseButton }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('layout', blockLayoutChoices),
            propDef('initiallyOpen', 'boolean', {state: true}),
            propDef('showCloseButton', 'boolean'),
            propDef('styles', 'styles'),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return 'Page' }
}
