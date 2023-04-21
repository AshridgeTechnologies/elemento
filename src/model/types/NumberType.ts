import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef} from '../Types'
import Rule from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

const formatChoices = ['integer', 'currency'] as const
type Format = typeof formatChoices[number]
type Properties = BaseTypeProperties & {
    readonly min?: number,
    readonly max?: number,
    readonly format?: Format,
}

export default class NumberType extends BaseTypeElement<Properties> implements Element {

    static kind = 'NumberType'
    static get iconClass() { return 'pin_outlined' }

    get min() {return this.properties.min}
    get max() {return this.properties.max}
    get format() {return this.properties.format}

    get shorthandRules() {
        const {min, max, format} = this
        const formatDescriptions = {
            integer: 'a whole number',
            currency: 'a currency amount',
        }
        return [
            min && new Rule('_', '_min', {description: `Minimum ${min}`, formula: `min(${min})`}),
            max && new Rule('_', '_max', {description: `Maximum ${max}`, formula: `max(${max})`}),
            format && new Rule('_', '_format', {description: `Must be ${formatDescriptions[format]}`, formula: `${format}()`}),
        ].filter(el => !!el) as Rule[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('min', 'number'),
            propDef('max', 'number'),
            propDef('format', formatChoices),
        ])
    }
}
