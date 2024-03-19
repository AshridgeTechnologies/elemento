import Element from './Element'
import {propDef} from './BaseElement'
import {ComponentType, ElementType, eventAction, ParentType, PropertyDef, PropertyExpr, PropertyType, PropertyValueType} from './Types'
import {elementHasParentTypeOf} from './createElement'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'

type Properties = BaseInputProperties<object> & Partial<Readonly<{
    horizontal: PropertyValueType<boolean>,
    width: PropertyValueType<number | string>,
    wrap: PropertyValueType<boolean>,
    keyAction: PropertyExpr,
    submitAction: PropertyExpr,
}>>

export default class Form extends BaseInputElement<Properties> implements Element {

    readonly kind = 'Form'
    get iconClass() { return 'dns' }
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
    ] }

    protected ownPropertyDefs(): PropertyDef[] {
        return [
            propDef('horizontal', 'boolean'),
            propDef('wrap', 'boolean'),
            propDef('keyAction', eventAction('$event')),
            propDef('submitAction', eventAction('$form', '$data'), {state: true, multilineExpr: true}),
        ]
    }

    get valueType(): PropertyType {
        return 'object'
    }

}
