import Element from './Element'
import {PropertyExpr, PropertyType, PropertyValueType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = BaseInputProperties<string> & {
    readonly multiline?: PropertyValueType<boolean>,
    readonly width?: PropertyValueType<string|number>,
    readonly readOnly?: PropertyValueType<boolean>,
    readonly label?: PropertyValueType<string>
    readonly dataType?: PropertyExpr
}

export default class TextInput extends BaseInputElement<Properties> implements Element {

    static kind = 'TextInput'
    static get iconClass() { return 'crop_16_9' }
    get valueType(): PropertyType { return 'string' }

    get multiline() { return this.properties.multiline }
    get width() { return this.properties.width }

    get propertyDefs() {
        return [
            ...super.propertyDefs,
            propDef('width', 'string|number'),
            propDef('multiline', 'boolean'),
        ]
    }
}
