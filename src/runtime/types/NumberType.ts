import Rule from './Rule'
import validator from 'validator'
import BaseType, {BaseProperties} from './BaseType'

export const formats = {
    integer: {valFn: (item: number) => validator.isInt(item.toString()), desc: 'a whole number' },
    decimal: {valFn: (item: number) => validator.isDecimal(item.toString()), desc: 'a decimal number' },
}

type Format = keyof typeof formats

type Properties = Partial<Readonly<BaseProperties & {
    min: number,
    max: number,
    format: Format,
}>>

export default class NumberType extends BaseType<number, Properties>{
    constructor(name: string, properties: Properties = {}, rules: Rule[] = []) {
        super('Number', name, properties, rules)
    }

    get min() { return this.properties.min }
    get max() { return this.properties.max }
    get format() { return this.properties.format }

    protected get shorthandRules(): Rule[] {
        const {min, max, format} = this
        return [
            min && new Rule('_min', (item: any) => item >= min, {description: `Minimum ${min}`}),
            max && new Rule('_max', (item: any) => item <= max, {description: `Maximum ${max}`}),
            format    && new Rule('_format',    (item: any) => formats[format].valFn(item), {description: `Must be ${formats[format].desc}`}),
        ].filter(el => !!el) as Rule[]
    }

    isCorrectDataType(item: any): boolean {
        return typeof item === 'number'
    }
}
