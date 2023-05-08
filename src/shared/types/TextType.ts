import Rule from './Rule'
import validator from 'validator'
import BaseType, {BaseProperties} from './BaseType'

const formats = {
    email: validator.isEmail,
    url: (item: string) => validator.isURL(item, {protocols: ['http', 'https'], require_protocol: true, require_valid_protocol: true}),
    multiline: () => true} as const

type Format = keyof typeof formats

type Properties = BaseProperties & Partial<Readonly<{
    minLength: number,
    maxLength: number,
    format: Format,
}>>

export default class TextType extends BaseType<string, Properties> {

    constructor(name: string, properties: Properties = {}, rules: Rule[] = []) {
        super('Text', name, properties, rules)
    }

    get minLength() { return this.properties.minLength }
    get maxLength() { return this.properties.maxLength }
    get format() { return this.properties.format }

    protected get shorthandRules(): Rule[] {
        const {minLength, maxLength, format} = this
        return [
            minLength && new Rule('_minLength', (item: any) => item.length >= minLength, {description: `Minimum length ${minLength}`}),
            maxLength && new Rule('_maxLength', (item: any) => item.length <= maxLength, {description: `Maximum length ${maxLength}`}),
            format    && new Rule('_format',    (item: any) => formats[format](item), {description: `Must be a valid ${format}`}),
        ].filter(el => !!el) as Rule[]
    }
}