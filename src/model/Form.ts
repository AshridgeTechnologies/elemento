import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {
    ComponentType,
    ElementType, eventAction,
    ParentType,
    PropertyDef,
    PropertyExpr,
    PropertyType,
    PropertyValueType
} from './Types'
import {elementHasParentTypeOf} from './createElement'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'

type Properties = BaseInputProperties<object> & {
    readonly horizontal?: PropertyValueType<boolean>,
    readonly width?: PropertyValueType<number | string>,
    readonly wrap?: PropertyValueType<boolean>,
    readonly keyAction?: PropertyExpr,
    readonly submitAction?: PropertyExpr,
}

export default class Form extends BaseInputElement<Properties> implements Element {

    static kind = 'Form'
    static get iconClass() { return 'dns' }
    type(): ComponentType { return 'statefulUI' }

    get horizontal() { return this.properties.horizontal ?? false }
    get width() { return this.properties.width }
    get wrap() { return this.properties.wrap ?? false }
    get keyAction() { return this.properties.keyAction }
    get submitAction() { return this.properties.submitAction }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return ['Page', 'Form', 'Layout'] }

    get propertyDefs(): PropertyDef[] { return [
        propDef('initialValue', 'expr', {state: true}),
        ...super.propertyDefs.filter( ({name}) => name !== 'initialValue'),
        propDef('horizontal', 'boolean'),
        propDef('width', 'string|number'),
        propDef('wrap', 'boolean'),
        propDef('keyAction', eventAction('$event')),
        propDef('submitAction', eventAction('$form', '$data'), {state: true, multilineExpr: true}),
    ] }

    get valueType(): PropertyType {
        return 'object'
    }

}