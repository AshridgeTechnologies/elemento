import Rule from './Rule'
import validator from 'validator'
import BaseType, {BaseProperties} from './BaseType'
import {isValid as isValidDate} from 'date-fns'

const formats = {
    integer: {valFn: (item: number) => validator.isInt(item.toString()), desc: 'a whole number' },
    currency: {valFn: (item: number) => validator.isCurrency(item.toString(), {digits_after_decimal: [1, 2]}), desc: 'a currency amount'},
}
type ChoiceValue = string | number | boolean | Date
type Properties = Partial<Readonly<BaseProperties & {
    values: ChoiceValue[],
    valueNames: (string | null | undefined)[],
}>>

export default class ChoiceType extends BaseType<string, Properties>{
    constructor(name: string, properties: Properties = {}, rules: Rule[] = []) {
        super('Choice', name, properties, rules)
    }

    get values() { return this.properties.values ?? [] }
    get valueNames() {
        const names = this.properties.valueNames ?? []
        return this.values.map((val, index) => names[index] ?? val)
    }

    protected get shorthandRules(): Rule[] {
        const valuesDescription = () => {
            const numberOfValuesShown = 10
            const valuesShown = this.valueNames.slice(0, numberOfValuesShown).join(', ')
            const ellipsis = (this.values.length > numberOfValuesShown) ? ', ...' : ''
            return valuesShown + ellipsis
        }
        return [
            new Rule('_values', (item: any) => this.values.includes(item), {description: `One of: ${valuesDescription()}`}),
        ]
    }

    isCorrectDataType(item: any): boolean {
        return ['number', 'string', 'boolean'].includes(typeof item) || isValidDate(item)
    }
}