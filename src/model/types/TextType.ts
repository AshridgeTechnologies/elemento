import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef} from '../Types'
import Rule from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

const formatChoices = ['email', 'url', 'multiline'] as const
type Format = typeof formatChoices[number]
type Properties = BaseTypeProperties & {
    readonly minLength?: number,
    readonly maxLength?: number,
    readonly format?: Format,
}

export default class TextType extends BaseTypeElement<Properties> implements Element {

    static kind = 'TextType'
    static get iconClass() { return 'abc_outlined' }

    get minLength() {return this.properties.minLength}
    get maxLength() {return this.properties.maxLength}
    get format() {return this.properties.format}

    get shorthandRules() {
        const {minLength, maxLength, format} = this
        return [
            minLength && new Rule('_', '_minLength', {description: `Minimum length ${minLength}`, formula: `minLength(${minLength})`}),
            maxLength && new Rule('_', '_maxLength', {description: `Maximum length ${maxLength}`, formula: `maxLength(${maxLength})`}),
            format && new Rule('_', '_format', {description: `Must be a valid ${format}`, formula: `${format}()`}),
        ].filter(el => !!el) as Rule[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('minLength', 'number'),
            propDef('maxLength', 'number'),
            propDef('format', formatChoices),
        ])
    }
}
