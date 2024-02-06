import {ComponentType, PropertyDef, PropertyExpr, PropertyType, PropertyValueType, Show, Styling} from './Types'
import BaseElement, {propDef} from './BaseElement'


export type BaseInputProperties<T> = Partial<Readonly<{
    initialValue: PropertyValueType<T>,
    label: PropertyValueType<string>
    readOnly: PropertyValueType<boolean>,
    dataType: PropertyExpr
}>> & Styling & Show

export default abstract class BaseInputElement<PropertiesType extends BaseInputProperties<any>> extends BaseElement<PropertiesType> {

    type(): ComponentType { return 'statefulUI' }
    abstract get valueType(): PropertyType

    get initialValue() { return this.properties.initialValue }
    get label(): PropertyValueType<string> | undefined { return this.properties.label ?? this.name }
    get readOnly() { return this.properties.readOnly }
    get dataType() { return this.properties.dataType }
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', this.valueType, {state: true}),
            propDef('label', 'string'),
            propDef('readOnly', 'boolean'),
            propDef('dataType', 'expr', {state: true}),
            propDef('show', 'boolean'),
            ...this.ownPropertyDefs(),
            propDef('styles', 'styles')
        ]
    }

    protected ownPropertyDefs(): PropertyDef[] {
        return []
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'value', 'originalValue', 'valid', 'errors', 'modified'
        ])
    }
}
