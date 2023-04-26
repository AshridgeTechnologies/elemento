import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef, PropertyValueType} from '../Types'
import {BuiltInRule, RuleWithDescription} from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

const formatChoices = ['integer', 'currency'] as const
type Format = typeof formatChoices[number]
type Properties = BaseTypeProperties & {
    readonly min?: PropertyValueType<number>,
    readonly max?: PropertyValueType<number>,
    readonly format?: Format,
}

export default class NumberType extends BaseTypeElement<Properties> implements Element {

    static kind = 'NumberType'
    static get iconClass() { return 'pin_outlined' }

    get min() {return this.properties.min}
    get max() {return this.properties.max}
    get format() {return this.properties.format}

    get rulesFromProperties() {
        const {min, max, format} = this
        const formatDescriptions = {
            integer: 'a whole number',
            currency: 'a currency amount',
        }
        return [
            min && new BuiltInRule(`Minimum ${min}`),
            max && new BuiltInRule(`Maximum ${max}`),
            format && new BuiltInRule(`Must be ${formatDescriptions[format]}`),
        ].filter(el => !!el) as RuleWithDescription[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('min', 'number'),
            propDef('max', 'number'),
            propDef('format', formatChoices),
        ])
    }
}
