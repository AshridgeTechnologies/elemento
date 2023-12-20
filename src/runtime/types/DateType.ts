import Rule from './Rule'
import BaseType, {BaseProperties} from './BaseType'
import {format, isValid} from 'date-fns'

type Properties = Partial<Readonly<BaseProperties & {
    min: Date,
    max: Date,
}>>

const dateLessThanOrEqual = (date: Date, latestDate: Date) => date.toISOString().slice(0, 10) <= latestDate.toISOString().slice(0, 10)
const formatDisplay = (date: Date) => format(date, 'dd MMM yyyy')

export default class DateType extends BaseType<Date, Properties>{
    constructor(name: string, properties: Properties = {}, rules: Rule[] = []) {
        super('Date', name, properties, rules)
    }

    get min() { return this.properties.min }
    get max() { return this.properties.max }

    protected get shorthandRules(): Rule[] {
        const {min, max} = this
        return [
            min && new Rule('_min', (item: any) => item >= min, {description: `Earliest ${formatDisplay(min)}`}),
            max && new Rule('_max', (item: any) => dateLessThanOrEqual(item, max), {description: `Latest ${formatDisplay(max)}`}),
        ].filter(el => !!el) as Rule[]
    }

    isCorrectDataType(item: any): boolean {
        return isValid(item)
    }
}