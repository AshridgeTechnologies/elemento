import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef, PropertyValueType} from '../Types'
import {BuiltInRule, RuleWithDescription} from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

const formatChoices = ['email', 'url', 'multiline'] as const
type Format = typeof formatChoices[number]
type Properties = BaseTypeProperties & {
    readonly minLength?: PropertyValueType<number>,
    readonly maxLength?: PropertyValueType<number>,
    readonly format?: Format,
}

export default class TextType extends BaseTypeElement<Properties> implements Element {

    static kind = 'TextType'
    static get iconClass() { return 'abc_outlined' }

    get minLength() {return this.properties.minLength}
    get maxLength() {return this.properties.maxLength}
    get format() {return this.properties.format}

    get rulesFromProperties() {
        const {minLength, maxLength, format} = this
        return [
            minLength && new BuiltInRule(`Minimum length ${minLength}`),
            maxLength && new BuiltInRule(`Maximum length ${maxLength}`),
            format && new BuiltInRule(`Must be a valid ${format}`),
        ].filter(el => !!el) as RuleWithDescription[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('minLength', 'number'),
            propDef('maxLength', 'number'),
            propDef('format', formatChoices),
        ])
    }
}
