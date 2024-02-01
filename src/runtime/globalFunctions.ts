import {fromPairs, isNil, last, sort, splitEvery, takeWhile} from 'ramda'
import {
    add,
    differenceInCalendarDays,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInMonths,
    differenceInSeconds,
    differenceInYears,
    format, isValid,
    parse,
    parseISO
} from 'date-fns'
import Papa, {ParseConfig} from 'papaparse'
import {Value, valueOf, valuesOf} from './runtimeFunctions'
import {isNumeric, noSpaces} from '../util/helpers'
import {ceil, floor, round} from 'lodash'
import BigNumber from 'bignumber.js'
import {isArray} from 'lodash'
import {assign, isFunction, isObject, mapValues, pick} from 'radash'

type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'
const unitTypes = ['seconds' , 'minutes' , 'hours' , 'days' , 'months' , 'years']

export type DecimalType = BigNumber
type DecimalOrNumber = DecimalType | number
type DecimalVal = Value<string | number | BigNumber>
type OpType = 'plus' | 'minus' | 'times' | 'div'
type ComparisonOpType = 'gt' | 'gte' | 'lt' | 'lte' | 'eq'

export class ValidationError extends Error {}

function Decimal(arg: DecimalVal) {
    return new BigNumber(valueOf(arg))
}

function decimalOp(op: OpType, initialValue: number | undefined, ...args: DecimalVal[]): DecimalOrNumber {
    const reducer = (acc: DecimalVal, val: DecimalVal): DecimalOrNumber => {
        const [accVal, valVal] = valuesOf(acc, val)
        if (typeof accVal === 'number' && typeof valVal === 'number') {
            switch(op) {
                case 'plus': return accVal + valVal
                case 'minus': return accVal - valVal
                case 'times': return accVal * valVal
                case 'div': return accVal / valVal
            }
        }
        return Decimal(acc)[op](Decimal(val))
    }
    return initialValue !== undefined ? <BigNumber>args.reduce(reducer, initialValue) : <BigNumber>args.reduce(reducer)
}

function comparisonOp(op: ComparisonOpType, arg1: DecimalVal | Date, arg2: DecimalVal | Date): boolean {
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        switch(op) {
            case "gt":  return arg1 >  arg2
            case "gte": return arg1 >= arg2
            case "lt":  return arg1 <  arg2
            case "lte": return arg1 <= arg2
            case "eq":  return arg1 === arg2
        }
    }
    if (arg1 instanceof Date && arg2 instanceof Date) {
        return Decimal(arg1.getTime())[op](Decimal(arg2.getTime()))
    }
    return Decimal(arg1)[op](Decimal(arg2))
}

export const globalFunctions = {
    valueOf,

    Decimal,

    D(s: DecimalVal | TemplateStringsArray) {
        return isArray(s) ? Decimal(s[0]) : Decimal(s as DecimalVal)
    },

    Sub(...args: DecimalVal[]): DecimalOrNumber {
        return decimalOp('minus', undefined, ...args)
    },

    Mult(...args: DecimalVal[]): DecimalOrNumber {
        return decimalOp('times', 1, ...args)
    },

    Div(...args: DecimalVal[]): DecimalOrNumber {
        return decimalOp('div', undefined, ...args)
    },

    Gt(arg1: DecimalVal, arg2: DecimalVal): boolean {
        return comparisonOp('gt', arg1, arg2)
    },

    Gte(arg1: DecimalVal, arg2: DecimalVal): boolean {
        return comparisonOp('gte', arg1, arg2)
    },

    Lt(arg1: DecimalVal, arg2: DecimalVal): boolean {
        return comparisonOp('lt', arg1, arg2)
    },

    Lte(arg1: DecimalVal, arg2: DecimalVal): boolean {
        return comparisonOp('lte', arg1, arg2)
    },

    Eq(arg1: DecimalVal, arg2: DecimalVal): boolean {
        return comparisonOp('eq', arg1, arg2)
    },

    Sum(...args: DecimalVal[]) {
        return decimalOp('plus', 0, ...args)
    },

    Log(...args: any[]) {
        console.log(...args)
    },

    If(condition: any, trueValue: any, falseValue?: any) {
        const getVal = (fnOrVal: any) => isFunction(fnOrVal) ? fnOrVal() : fnOrVal
        return valueOf(condition) ? getVal(trueValue) : getVal(falseValue)
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

    Max(...args: DecimalVal[]) {
        if (args.length === 0) throw new Error('Wrong number of arguments to Max. Expected at least 1 argument.')
        const reducer = (acc: DecimalVal, val: DecimalVal): DecimalOrNumber => {
            const [accVal, valVal] = valuesOf(acc, val)
            if (typeof accVal === 'number' && typeof valVal === 'number') return Math.max(accVal, valVal)
            return Decimal(acc).gte(Decimal(val)) ? Decimal(acc)  : Decimal(val)
        }
        return <BigNumber>args.reduce(reducer, Number.MIN_VALUE)
    },

    Min(...args: DecimalVal[]) {
        if (args.length === 0) throw new Error('Wrong number of arguments to Min. Expected at least 1 argument.')
        const reducer = (acc: DecimalVal, val: DecimalVal): DecimalOrNumber => {
            const [accVal, valVal] = valuesOf(acc, val)
            if (typeof accVal === 'number' && typeof valVal === 'number') return Math.min(accVal, valVal)
            return Decimal(acc).lte(Decimal(val)) ? Decimal(acc)  : Decimal(val)
        }
        return <BigNumber>args.reduce(reducer, Number.MAX_VALUE)    },

    Round(n: Value<number> = 0, decimalDigits: Value<number> = 0): number {
        return round(valueOf(n), valueOf(decimalDigits))
    },

    Ceiling(n: Value<number> = 0, decimalDigits: Value<number> = 0): number {
        return ceil(valueOf(n), valueOf(decimalDigits))
    },

    Floor(n: Value<number> = 0, decimalDigits: Value<number> = 0): number {
        return floor(valueOf(n), valueOf(decimalDigits))
    },

    Record(...args: Value<any>[]) {
        const argVals = args.map(valueOf)
        const objectArgs = takeWhile(isObject, argVals)
        const objectArgVals = objectArgs.map( x => mapValues(x, valueOf))
        const mergedBaseResult = objectArgVals.reduce(assign, {})

        const nameValuePairArgs = argVals.slice(objectArgs.length)
        if (nameValuePairArgs.length % 2 !== 0) throw new Error('Odd number of arguments - must have pairs of name, value')
        const pairs = splitEvery(2, nameValuePairArgs) as [string, any][]
        if (!pairs.every( ([name]) => typeof name === 'string')) throw new Error('Incorrect argument types - must have pairs of name, value')
        const pairsResult = fromPairs(pairs)

        return assign(mergedBaseResult, pairsResult)
    },

    Pick(record: {[k: string]: any}, ...propertyNames: string[]) {
        if (!record) throw new Error('Wrong number of arguments to Pick. Expected record, names....')
        const pickedObj = pick(record, propertyNames)
        return mapValues(pickedObj, valueOf)
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

    DateVal(arg1?: string | number | null, arg2?: string | number, arg3?: number) {
        if (!arg1) return null

        if (arguments.length === 3) {
            return new Date(arg1 as number, arg2 as number - 1, arg3)
        }
        if (arguments.length === 2) {
            return parse(arg1 as string, arg2 as string, new Date())
        }
        if (typeof arg1 === 'string') {
            const isoDate = parseISO(arg1 as string)
            if (isValid(isoDate)) return isoDate
        }
        return new Date(arg1)
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
        const dateVal = valueOf(date)
        if (!dateVal) return ''
        if (!isValid(dateVal)) return 'Invalid Date'
        return format(dateVal, pattern)
    },

    Random(upperLimit: Value<number>) {
        const upperLimitVal = valueOf(upperLimit)
        return Math.floor((upperLimitVal + 1) * Math.random())
    },

    Check(condition: Value<any>, message: Value<string>) {
        const [conditionVal, messageVal] = valuesOf(condition, message)
        if (!conditionVal) {
            throw new ValidationError(messageVal)
        }
    },

    CsvToRecords(csvText: string, columnNames?: string[]) {
        const transform = (fieldRaw: string) => {
            const field = fieldRaw.trim()
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
        const lowerCaseId = (s: string) => s === 'Id' ? 'id' : s
        const transformHeader = (s: string) => noSpaces(lowerCaseId(s))
        const removeUndefinedFields = (obj: object) => {
            const definedEntries = Object.entries(obj).filter( ([key, value]) => value !== undefined && key !== '__parsed_extra')
            return Object.fromEntries(definedEntries)
        }
        const lines = csvText.split(/[\r\n]+/)
        const tabDelimiters = lines.every( line => line.includes('\t'))
        const delim = tabDelimiters ? '\t' : ','
        const textWithHeaders = columnNames ? columnNames.join(delim) + '\n' + csvText : csvText
        const config: ParseConfig = {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader,
            transform
        }
        const result = Papa.parse(textWithHeaders, config) as any
        return result.data.map(removeUndefinedFields)
    }
}

// for each function, the arguments that should be functions, and the argument names of those functions OR lazy to evaluate the argument only when neeeded
export const functionArgs = {
    Select: {1: ['$item']},
    ForEach: {1: ['$item']},
    First: {1: ['$item']},
    Last: {1: ['$item']},
    Sort: {1: ['$item']},
    If: {1: 'lazy', 2: 'lazy'}
}
