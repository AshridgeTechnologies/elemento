import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = {
    readonly initialValue?: PropertyValueType<string>,
    readonly maxLength?: PropertyValueType<number>,
    readonly multiline?: PropertyValueType<boolean>,
    readonly width?: PropertyValueType<string|number>,
    readonly readOnly?: PropertyValueType<boolean>,
    readonly label?: PropertyValueType<string>
}

export default class TextInput extends BaseInputElement<Properties> implements Element {

    static kind = 'TextInput'
    static get iconClass() { return 'crop_16_9' }
    get valueType():PropertyType { return 'string' }

    get maxLength() { return this.properties.maxLength }
    get multiline() { return this.properties.multiline }
    get width() { return this.properties.width }
    get readOnly() { return this.properties.readOnly }

    get propertyDefs() {
        return [
            ...super.propertyDefs,
            propDef('maxLength', 'number'),
            propDef('width', 'string|number'),
            propDef('multiline', 'boolean'),
            propDef('readOnly', 'boolean'),
        ]
    }
}
