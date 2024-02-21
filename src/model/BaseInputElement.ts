import {ComponentType, PropertyDef, PropertyExpr, PropertyType, PropertyValueType} from './Types'
import BaseElement, {propDef} from './BaseElement'


export type BaseInputProperties<T> = {
    readonly initialValue?: PropertyValueType<T>,
    readonly label?: PropertyValueType<string>
    readonly readOnly?: PropertyValueType<boolean>,
    readonly dataType?: PropertyExpr
}

export default abstract class BaseInputElement<PropertiesType extends BaseInputProperties<any>> extends BaseElement<PropertiesType> {

    type(): ComponentType { return 'statefulUI' }
    abstract get valueType(): PropertyType

    get initialValue() { return this.properties.initialValue }
    get label(): PropertyValueType<string> | undefined { return this.properties.label ?? this.name }
    get readOnly() { return this.properties.readOnly }
    get dataType() { return this.properties.dataType }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', this.valueType, {state: true}),
            propDef('label', 'string'),
            propDef('readOnly', 'boolean'),
            propDef('dataType', 'expr', {state: true}),
        ]
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'value', 'originalValue', 'valid', 'errors', 'modified'
        ])
    }
}
