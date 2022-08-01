import {ComponentType, PropertyDef, PropertyType, PropertyValueType} from './Types'
import BaseElement, {propDef} from './BaseElement'


export type BaseInputProperties = {
    readonly initialValue?: PropertyValueType<string | number | boolean>,
    readonly label?: PropertyValueType<string>
}

export default abstract class BaseInputElement<PropertiesType extends BaseInputProperties> extends BaseElement<PropertiesType> {

    type(): ComponentType { return 'statefulUI' }
    abstract get valueType(): PropertyType

    get initialValue() { return this.properties.initialValue }
    get label(): PropertyValueType<string> | undefined { return this.properties.label ?? this.name }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', this.valueType, {state: true}),
            propDef('label', 'string'),
        ]
    }
}