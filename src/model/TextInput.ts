import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement, {BaseInputProperties} from './BaseInputElement'
import {propDef} from './BaseElement'

export type Properties = BaseInputProperties<string>
    & Partial<Readonly<{
    multiline: PropertyValueType<boolean>,
}>>

export default class TextInput extends BaseInputElement<Properties> implements Element {

    readonly kind = 'TextInput'
    get iconClass() { return 'crop_16_9' }
    get valueType(): PropertyType { return 'string' }

    get multiline() { return this.properties.multiline }

    protected ownPropertyDefs() {
        return [
            propDef('multiline', 'boolean'),
        ]
    }
}
