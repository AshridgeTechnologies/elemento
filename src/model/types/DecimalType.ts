import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef, PropertyValueType} from '../Types'
import {BuiltInRule, RuleWithDescription} from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

type Properties = BaseTypeProperties & {
    readonly min?: PropertyValueType<number>,
    readonly max?: PropertyValueType<number>,
    readonly decimalPlaces?: number,
}

export default class DecimalType extends BaseTypeElement<Properties> implements Element {

    readonly kind = 'DecimalType'
    get iconClass() { return 'pin_outlined' }

    get min() {return this.properties.min}
    get max() {return this.properties.max}
    get decimalPlaces() {return this.properties.decimalPlaces}

    get rulesFromProperties() {
        const {min, max, decimalPlaces} = this
        const formatDescriptions = {
            integer: 'a whole number',
        }
        return [
            min && new BuiltInRule(`Minimum ${min}`),
            max && new BuiltInRule(`Maximum ${max}`),
            decimalPlaces && new BuiltInRule(`${decimalPlaces} decimal places`),
        ].filter(el => !!el) as RuleWithDescription[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('min', 'number'),
            propDef('max', 'number'),
            propDef('decimalPlaces', 'number'),
        ])
    }
}
