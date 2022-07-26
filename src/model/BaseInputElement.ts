import Element from './Element'
import {ComponentType, ElementId, ElementType, PropertyDef, PropertyType, PropertyValueType} from './Types'
import BaseElement, {propDef} from './BaseElement'


export type BaseInputProperties = {
    readonly initialValue?: PropertyValueType<string | number | boolean>,
    readonly label?: PropertyValueType<string>
}

export default abstract class BaseInputElement<PropertiesType extends BaseInputProperties> extends BaseElement<PropertiesType> {
    constructor(
        id: ElementId,
        name: string,
        kind: ElementType,
        properties: PropertiesType,
        elements: ReadonlyArray<Element> | undefined = undefined,
    ) {
        super(id, name, kind, properties, elements)
    }

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