import Element from './Element'
import {ComponentType, ElementId, PropertyValueType} from './Types'
import BaseElement from './BaseElement'


export type BaseInputProperties = {
    readonly initialValue?: PropertyValueType<string | number | boolean>,
    readonly label?: PropertyValueType<string>
}

export default abstract class BaseInputElement<PropertiesType extends BaseInputProperties> extends BaseElement<PropertiesType> {
    constructor(
        id: ElementId,
        name: string,
        properties: PropertiesType,
        elements: ReadonlyArray<Element> | undefined = undefined,
    ) {
        super(id, name, properties, elements)
    }

    componentType = 'statefulUI' as ComponentType

    get initialValue() { return this.properties.initialValue }
    get label() { return this.properties.label ?? this.name }
}