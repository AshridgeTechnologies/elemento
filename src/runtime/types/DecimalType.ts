import Rule from './Rule'
import BaseType, {BaseProperties} from './BaseType'
import BigNumber from 'bignumber.js'
import {isNil} from 'ramda'
import {formats} from './NumberType'

type Properties = Partial<Readonly<BaseProperties & {
    min: BigNumber,
    max: BigNumber,
    decimalPlaces: number,
}>>
type InputProperties = Partial<Readonly<BaseProperties & {
    min: BigNumber | number,
    max: BigNumber | number,
    decimalPlaces: number,
}>>

export default class DecimalType extends BaseType<BigNumber | number, Properties>{
    constructor(name: string, properties: InputProperties = {}, rules: Rule[] = []) {
        const {description, required, min, max, decimalPlaces} = properties
        const propsConverted = {
            description, required,
            min: !isNil(min) ? new BigNumber(min) : undefined,
            max: !isNil(max) ? new BigNumber(max) : undefined,
            decimalPlaces
        }
        super('Decimal', name, propsConverted, rules)
    }

    get min() { return this.properties.min }
    get max() { return this.properties.max }
    get decimalPlaces() { return this.properties.decimalPlaces }
    get format() { return formats.decimal }

    protected get shorthandRules(): Rule[] {
        const {min, max, decimalPlaces} = this
        return [
            min && new Rule('_min', (item: any) => min.lte(item), {description: `Minimum ${min}`}),
            max && new Rule('_max', (item: any) => max.gte(item), {description: `Maximum ${max}`}),
            decimalPlaces && new Rule('_format',    (item: any) => (new BigNumber(item).dp() ?? 0) <= decimalPlaces, {description: `${decimalPlaces} decimal places`}),
        ].filter(el => !!el) as Rule[]
    }

    isCorrectDataType(item: any): boolean {
        return BigNumber.isBigNumber(item) || typeof item === 'number'
    }
}
