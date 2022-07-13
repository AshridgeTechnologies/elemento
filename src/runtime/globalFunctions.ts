import {fromPairs, isNil, last, sort, sortBy, splitEvery} from 'ramda'
import {
    add,
    differenceInCalendarDays,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInMonths,
    differenceInSeconds,
    differenceInYears,
    format,
    parseISO
} from 'date-fns'
import * as csv from 'csv-parse/sync'
import {Value, valueOf, valuesOf} from './runtimeFunctions'
import {isNumeric, noSpaces} from '../util/helpers'
import {CastingContext} from 'csv-parse/lib'

type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'
const unitTypes = ['seconds' , 'minutes' , 'hours' , 'days' , 'months' , 'years']

export const globalFunctions = {
    valueOf,

    Sum(...args: Value<number>[]) {
        return args.reduce( (acc, val) => (acc as number) + (val as number), 0)
    },

    Log(...args: any[]) {
        console.log(...args)
    },

    If(condition: any, trueValue: any, falseValue?: any) {
        return valueOf(condition) ? trueValue : falseValue
    },

    Left(s: Value<string>, length: Value<number>) {
        return valueOf(s).substring(0, valueOf(length))
    },

    Mid(s: Value<string>, start: Value<number>, length?: Value<number>) {
        const sVal = valueOf(s), startVal = valueOf(start), lengthVal = valueOf(length)
        if (startVal < 1) throw new Error(`Function Mid parameter 2 (start) is ${startVal}. It should be greater than or equal to 1.`)
        if (lengthVal !== undefined && lengthVal < 0) throw new Error(`Function Mid parameter 3 (length) is ${lengthVal}. It should be greater than or equal to 0.`)
        return sVal.substring(startVal - 1, startVal - 1 + (lengthVal ?? sVal.length))
    },

    Right(s: Value<string>, length: Value<number>) {
        const sVal = valueOf(s), lengthVal = valueOf(length)
        return sVal.substring(sVal.length - lengthVal)
    },

    And(...args: Value<any>[]) {
        return args.reduce( (prev, curr) => prev && !!valueOf(curr), true )
    },

    Or(...args: Value<any>[]) {
        return args.reduce( (prev, curr) => prev || !!valueOf(curr), false )
    },

    Not(arg: Value<any>) {
        return !valueOf(arg)
    },

    Substitute(s: Value<string>, toReplace: Value<string>, replaceWith: Value<string>) {
        const sVal = valueOf(s), toReplaceVal = valueOf(toReplace), replaceWithVal = valueOf(replaceWith)
        if (toReplaceVal === '') return sVal
        return sVal.replace(new RegExp(toReplaceVal, 'g'), replaceWithVal)
    },

    Max(...args: Value<number>[]) {
        if (args.length === 0) throw new Error('Wrong number of arguments to Max. Expected at least 1 argument.')
        return Math.max(...args as number[])
    },

    Min(...args: Value<number>[]) {
        if (args.length === 0) throw new Error('Wrong number of arguments to Min. Expected at least 1 argument.')
        return Math.min(...args as number[])
    },

    Record(...args: Value<any>[]) {
        if (args.length % 2 !== 0) throw new Error('Odd number of arguments - must have pairs of name, value')
        const argVals = args.map( valueOf )
        const pairs = splitEvery(2, argVals) as [string, any][]
        return fromPairs(pairs)
    },

    List(...args: Value<any>[]) {
        return args.map( valueOf )
    },

    Select(list: Value<any[]>, condition: (item: any) => boolean) {
        const listVal = valueOf(list) ?? []
        if (condition === undefined) throw new Error('Wrong number of arguments to Select. Expected list, expression.')
        return listVal.filter(condition)
    },

    ForEach(list: Value<any[]>, transform: (item: any) => any) {
        const listVal = valueOf(list) ?? []
        if (transform === undefined) throw new Error('Wrong number of arguments to ForEach. Expected list, expression.')
        return listVal.map(transform)
    },

    First(list: Value<any[]>, condition: (item: any) => boolean = () => true) {
        const listVal = valueOf(list) ?? []
        if (list === undefined) throw new Error('Wrong number of arguments to First. Expected list, optional expression.')
        return listVal.filter(condition)[0] ?? null
    },

    Last(list: Value<any[]>, condition: (item: any) => boolean = () => true) {
        const listVal = valueOf(list) ?? []
        if (list === undefined) throw new Error('Wrong number of arguments to Last. Expected list, optional expression.')
        return last(listVal.filter(condition)) ?? null
    },

    Sort(list: Value<any[]>, sortKeyFn: (item: any) => any | any[]): any[] {
        const compareItems = (a: any, b: any): -1 | 0 | 1 => {
            const aa = sortKeyFn(a), bb = sortKeyFn(b)
            return compareValues(aa, bb)
        }

        const compareValues = (a: any, b: any): -1 | 0 | 1 => {
            if (isNil(a) && isNil(b)) {
                return 0
            } else if (isNil(a)) {
                return -1
            } else if (isNil(b)) {
                return 1
            }
            if (Array.isArray(a) && Array.isArray(b)) {
                return compareArrays(a, b)
            }
            return a < b ? -1 : a > b ? 1 : 0
        }

        const compareArrays = (a: any[], b: any[]) => {
            for (let i = 0; i < a.length; i++) {
                const compareVal = compareValues(a[i], b[i])
                if (compareVal !== 0) {
                    return compareVal
                }
            }
            return 0
        }

        const listVal = valueOf(list)
        if (isNil(listVal)) {
            return listVal
        }
        return sort(compareItems, listVal)
    },

    Timestamp() {
        return Date.now()
    },

    Now() {
        return new Date()
    },

    Today(date = new Date()) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() ))
    },

    TimeBetween(date1Val: Value<Date>, date2Val: Value<Date>, unitVal: Value<TimeUnit>) {
        const [date1, date2, unit] = valuesOf(date1Val, date2Val, unitVal)
        if (!date1 || !date2) return undefined
        const unitTypes = ['seconds' , 'minutes' , 'hours' , 'days' , 'months' , 'years']
        switch(unit) {
            case 'seconds': return differenceInSeconds(date2, date1)
            case 'minutes': return differenceInMinutes(date2, date1)
            case 'hours': return differenceInHours(date2, date1)
            case 'days': return differenceInDays(date2, date1)
            case 'months': return differenceInMonths(date2, date1)
            case 'years': return differenceInYears(date2, date1)
            default: throw new Error(`Unknown unit ${unit}.  Should be one of ${unitTypes.join(', ')}`)
        }

    },

    DaysBetween(date1Val: Value<Date>, date2Val: Value<Date>) {
        const [date1, date2] = valuesOf(date1Val, date2Val)
        if (!date1 || !date2) return undefined
        return differenceInCalendarDays(date2, date1)
    },

    DateAdd(dateVal: Value<Date>, changeVal: Value<number>, unitVal: Value<TimeUnit>) {
        const [date, change, unit] = valuesOf(dateVal, changeVal, unitVal)
        if (!unitTypes.includes(unit)) {
            throw new Error(`Unknown unit ${unit}.  Should be one of ${unitTypes.join(', ')}`)
        }
        if (!date || change === undefined || change === null) return undefined

        return add(date, {[unit]: change})
    },

    DateFormat(date: Value<Date>, pattern: string) {
        if (!date) return ''
        return format(valueOf(date), pattern)
    },

    CsvToRecords(csvText: string, columnNames?: string[]) {
        const cast = (field: string, context: CastingContext) => {
            if (context.quoting) return field
            if (field === '') return undefined
            if (isNumeric(field)) return Number(field)
            if (field.toLowerCase() === 'true') return true
            if (field.toLowerCase() === 'false') return false
            const date = parseISO(field)
            if (!Number.isNaN(date.getTime())) {
                return date
            }
            return field
        }
        const convertColumnNames = (names: string[]) => names.map( noSpaces )
        const removeUndefinedFields = (obj: object) => {
            const definedEntries = Object.entries(obj).filter( ([, value]) => value !== undefined)
            return Object.fromEntries(definedEntries)
        }
        const lines = csvText.split(/[\r\n]+/)
        const tabDelimiters = lines.every( line => line.includes('\t'))
        return csv.parse(csvText, {
            columns: columnNames ? convertColumnNames(columnNames): convertColumnNames,
            delimiter: tabDelimiters ? '\t' : ',',
            cast,
            skip_empty_lines: true,
            skip_records_with_empty_values: true,
            relax_quotes: true,
            relax_column_count: true,
            trim: true
        }).map(removeUndefinedFields)
    }
}

export const functionArgIndexes = {
    Select: [1],
    ForEach: [1],
    First: [1],
    Last: [1],
    Sort: [1],
}