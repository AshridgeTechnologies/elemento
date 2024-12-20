import {equals, flatten, fromPairs, identity, isNil, last, reverse, sort, splitEvery, takeWhile, without} from 'ramda'
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
    isValid,
    parse,
    parseISO
} from 'date-fns'
import Papa, {ParseConfig} from 'papaparse'
import {Value, valueOf, valuesOf} from './runtimeFunctions'
import {isNumeric, noSpaces, notEmpty} from '../util/helpers'
import {ceil, floor, isPlainObject, round} from 'lodash'
import BigNumber from 'bignumber.js'
import {assign, clone, group, isArray, isFunction, isObject, mapValues, pick, shuffle} from 'radash'

type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'
const unitTypes = ['seconds' , 'minutes' , 'hours' , 'days' , 'months' , 'years']

export type DecimalType = BigNumber
type DecimalOrNumber = DecimalType | number
type DecimalVal = Value<string | number | BigNumber>
type DecimalValOrNull = DecimalVal | null
type DecimalValOrArrayOrNull = DecimalValOrNull | DecimalValOrNull[] | null
type ComparisonValOrNull = DecimalValOrNull | boolean
type OpType = 'plus' | 'minus' | 'times' | 'div'
type ComparisonOpType = 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
type ForEachArrayTransform = (it: any, index: number) => any
type ForEachObjectTransform = (it: any, key: string) => any
type ForEachTransform = ForEachArrayTransform | ForEachObjectTransform

export class ValidationError extends Error {}

function Decimal(arg: DecimalValOrNull) {
    return new BigNumber(valueOf(arg ?? 0))
}

function decimalOp(op: OpType, initialValue: number | undefined, ...args: DecimalValOrNull[]): DecimalOrNumber {
    const reducer = (accVal: DecimalValOrNull, valVal: DecimalValOrNull): DecimalOrNumber => {
        const acc = valueOf(accVal) ?? 0, val =  valueOf(valVal) ?? 0
        if (typeof acc === 'number' && typeof val === 'number') {
            switch(op) {
                case 'plus': return acc + val
                case 'minus': return acc - val
                case 'times': return acc * val
                case 'div': return acc / val
            }
        }
        return Decimal(acc)[op](Decimal(val))
    }
    return initialValue !== undefined ? <BigNumber>args.reduce(reducer, initialValue) : <BigNumber>args.reduce(reducer)
}

function comparisonOp(op: ComparisonOpType, arg1Val: ComparisonValOrNull | Date, arg2Val: ComparisonValOrNull | Date): boolean {
    const [arg1, arg2] = valuesOf(arg1Val, arg2Val)
    if (isNil(arg1) && isNil(arg2)) {
        switch(op) {
            case 'gt':
            case 'lt':  return false
            case 'gte':
            case 'lte':
            case 'eq':  return true
        }
    }

    if (op === 'eq' && (arg1 === 0 && isNil(arg2) || isNil(arg1) && arg2 === 0)) {
        return false
    }

    const isStringOrBooleanOrNil = (arg: any) => isNil(arg) || typeof arg === 'string' || typeof arg === 'boolean'
    if (isStringOrBooleanOrNil(arg1) && isStringOrBooleanOrNil(arg2)) {
        const arg1ToCompare = arg1 ?? '',  arg2ToCompare = arg2 ?? ''
        switch(op) {
            case 'gt':  return arg1ToCompare >  arg2ToCompare
            case 'gte': return arg1ToCompare >= arg2ToCompare
            case 'lt':  return arg1ToCompare <  arg2ToCompare
            case 'lte': return arg1ToCompare <= arg2ToCompare
            case 'eq':  return arg1ToCompare === arg2ToCompare
        }
    }

    const isDateOrNil = (arg: any) => isNil(arg) || arg instanceof Date
    const asTime = (arg: typeof arg1) => arg instanceof Date ? arg.getTime() : 0
    if (isDateOrNil(arg1) && isDateOrNil(arg2)) {
        return Decimal(asTime(arg1))[op](Decimal(asTime(arg2)))
    }

    return Decimal(arg1)[op](Decimal(arg2))
}

function offsetItem(listVal: Value<any[]> | null, item: any, offset: number) {
    const list = valueOf(listVal) ?? []
    // const itemIndex = list.indexOf(item)
    const itemIndex = list.findIndex( it => equals(item, it))
    if (itemIndex === -1) return null
    return list[itemIndex + offset] ?? null
}

const parseUpdateArgs = (args: Value<any>[]) => {
    const argVals = args.map(valueOf)
    const objectArgs = takeWhile(isObject, argVals)
    const objectArgVals = objectArgs.map(x => mapValues(x, valueOf))
    const baseObject = objectArgVals.reduce(assign, {})

    const nameValuePairArgs = argVals.slice(objectArgs.length)
    if (nameValuePairArgs.length % 2 !== 0) throw new Error('Wrong number of arguments - must have pairs of name, value')
    const pairs = splitEvery(2, nameValuePairArgs) as [string | number, any][]
    if (!pairs.every(([name]) => typeof name === 'string' || typeof name === 'number')) throw new Error('Incorrect argument types - must have pairs of name, value')
    return {baseObject, pairs}
}

export const globalFunctions = {
    valueOf,

    Decimal,

    D(s: DecimalVal | TemplateStringsArray) {
        return isArray(s) ? Decimal(s[0]) : Decimal(s as DecimalVal)
    },

    Sub(...args: DecimalValOrNull[]): DecimalOrNumber {
        return decimalOp('minus', undefined, ...args)
    },

    Mult(...args: DecimalValOrNull[]): DecimalOrNumber {
        return decimalOp('times', 1, ...args)
    },

    Div(...args: DecimalValOrNull[]): DecimalOrNumber {
        return decimalOp('div', undefined, ...args)
    },

    Gt(arg1: ComparisonValOrNull, arg2: ComparisonValOrNull): boolean {
        return comparisonOp('gt', arg1, arg2)
    },

    Gte(arg1: ComparisonValOrNull, arg2: ComparisonValOrNull): boolean {
        return comparisonOp('gte', arg1, arg2)
    },

    Lt(arg1: ComparisonValOrNull, arg2: ComparisonValOrNull): boolean {
        return comparisonOp('lt', arg1, arg2)
    },

    Lte(arg1: ComparisonValOrNull, arg2: ComparisonValOrNull): boolean {
        return comparisonOp('lte', arg1, arg2)
    },

    Eq(arg1: ComparisonValOrNull, arg2: ComparisonValOrNull): boolean {
        return comparisonOp('eq', arg1, arg2)
    },

    Sum(...args: DecimalValOrArrayOrNull[]) {
        return decimalOp('plus', 0, ...flatten(args))
    },

    Average(...args: DecimalValOrArrayOrNull[]) {
        const flatArgs = flatten(args)
        const sum = decimalOp('plus', 0, ...flatArgs)
        return decimalOp('div', sum.valueOf() as number, flatArgs.length)
    },

    Log(...args: any[]) {
        console.log(...args)
    },

    IsNull(argVal: any) {
        if (arguments.length === 0) throw new Error('Wrong number of arguments to IsNull. Expected 1 argument.')
        const arg = valueOf(argVal)
        return arg === null || arg == undefined
    },

    NotNull(argVal: any) {
        if (arguments.length === 0) throw new Error('Wrong number of arguments to NotNull. Expected 1 argument.')
        const arg = valueOf(argVal)
        return arg !== null && arg !== undefined
    },

    If(condition: any, trueValue: any, falseValue?: any) {
        const getVal = (fnOrVal: any) => isFunction(fnOrVal) ? fnOrVal() : fnOrVal
        return valueOf(condition) ? getVal(trueValue) : getVal(falseValue)
    },

    Left(sVal: Value<string | null>, lengthVal: Value<number | null>) {
        const s = valueOf(sVal) ?? '', length = valueOf(lengthVal) ?? 0
        return s.substring(0, length)
    },

    Mid(sVal: Value<string | null>, startVal: Value<number | null>, lengthVal?: Value<number | null>) {
        const s = valueOf(sVal) ?? '', start = valueOf(startVal) ?? 1, length = valueOf(lengthVal) ?? s.length
        if (start < 1) throw new Error(`Function Mid parameter 2 (start) is ${start}. It should be greater than or equal to 1.`)
        if (length !== undefined && length < 0) throw new Error(`Function Mid parameter 3 (length) is ${length}. It should be greater than or equal to 0.`)
        return s.substring(start - 1, start - 1 + (length ?? s.length))
    },

    Right(sVal: Value<string | null>, lengthVal: Value<number | null>) {
        const s = valueOf(sVal) ?? '', length = valueOf(lengthVal) ?? 0
        return s.substring(s.length - length)
    },

    Lowercase(sVal: Value<string | null>) {
        const s = valueOf(sVal) ?? ''
        return s.toLowerCase()
    },

    Uppercase(sVal: Value<string | null>) {
        const s = valueOf(sVal) ?? ''
        return s.toUpperCase()
    },

    Split(sVal: Value<string> | null, sepVal?: Value<string> | null) {
        const [s, sep] = valuesOf(sVal, sepVal)
        if (isNil(s)) return []
        return s.split(sep ?? '')
    },

    Join(listVal: Value<any[]> | null, sepVal?: Value<string> | null) {
        const [list, sep] = valuesOf(listVal, sepVal)
        if (isNil(list)) return ''
        return list.join(sep ?? '')
    },

    Contains(sVal: Value<string | null>, searchVal: Value<string | null>, ignoreCase?: boolean) {
        const s = valueOf(sVal) ?? ''
        const search = valueOf(searchVal) ?? ''
        return ignoreCase ? s.toLowerCase().includes(search.toLowerCase()) : s.includes(search)
    },

    Substitute(sVal: Value<string | null>, toReplaceVal: Value<string | null>, replaceWithVal: Value<string | null>) {
        const s = valueOf(sVal) ?? '', toReplace = valueOf(toReplaceVal) ?? '', replaceWith = valueOf(replaceWithVal) ?? ''
        if (toReplace === '') return s
        return s.replace(new RegExp(toReplace, 'g'), replaceWith)
    },

    Trim(sVal: Value<string | null>) {
        const s = valueOf(sVal) ?? ''
        return s.trim()
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

    Max: function (...args: DecimalValOrArrayOrNull[]) {
        if (args.length === 0) throw new Error('Wrong number of arguments to Max. Expected at least 1 argument.')
        const reducer = (accVal: DecimalValOrNull, valVal: DecimalValOrNull): DecimalOrNumber => {
            const acc = valueOf(accVal), val = valueOf(valVal) ?? 0
            if (typeof acc === 'number' && typeof val === 'number') return Math.max(acc, val)
            return Decimal(acc).gte(Decimal(val)) ? Decimal(acc) : Decimal(val)
        }
        return <BigNumber>flatten(args).reduce(reducer, -Number.MAX_VALUE)
    },

    Min(...args: DecimalValOrArrayOrNull[]) {
        if (args.length === 0) throw new Error('Wrong number of arguments to Min. Expected at least 1 argument.')
        const reducer = (accVal: DecimalValOrNull, valVal: DecimalValOrNull): DecimalOrNumber => {
            const acc = valueOf(accVal) , val = valueOf(valVal) ?? 0
            if (typeof acc === 'number' && typeof val === 'number') return Math.min(acc, val)
            return Decimal(accVal).lte(Decimal(valVal)) ? Decimal(accVal)  : Decimal(valVal)
        }
        return <BigNumber>flatten(args).reduce(reducer, Number.MAX_VALUE)    },

    Round(n?: Value<number | null>, decimalDigits?: Value<number | null>): number {
        return round(valueOf(n) ?? 0, valueOf(decimalDigits) ?? 0)
    },

    Ceiling(n?: Value<number | null>, decimalDigits?: Value<number | null>): number {
        return ceil(valueOf(n) ?? 0, valueOf(decimalDigits) ?? 0)
    },

    Floor(n?: Value<number | null>, decimalDigits?: Value<number | null>): number {
        return floor(valueOf(n) ?? 0, valueOf(decimalDigits) ?? 0)
    },

    Len(val: Value<{length: number} | null>) {
        if (arguments.length < 1) throw new Error('Wrong number of arguments to Len. Expected text.')
        return (valueOf(val) ?? '').length
    },

    Record(...args: Value<any>[]) {
        const {baseObject, pairs} = parseUpdateArgs(args)
        const pairsWithStringKeys: [string, any][] = pairs.map(([name, value]) => [name.toString(), value])
        const pairsResult = fromPairs(pairsWithStringKeys)

        return assign(baseObject, pairsResult)
    },

    WithUpdates(original: any[] | {[k: string]: any}, ...updateArgs: any[]) {
        if (arguments.length < 2) throw new Error('Wrong number of arguments - must have pairs of name, value')
        const {baseObject, pairs} = parseUpdateArgs(updateArgs)
        const newValue = clone(valueOf(original)) as any
        Object.entries(baseObject).forEach(([prop, value]) => newValue[prop] = value)
        pairs.forEach( ([prop, value]) => newValue[prop] = value)
        return newValue
    },

    Pick(record: {[k: string]: any}, ...propertyNames: string[]) {
        if (!record) throw new Error('Wrong number of arguments to Pick. Expected record, names....')
        const pickedObj = pick(record, propertyNames)
        return mapValues(pickedObj, valueOf)
    },

    List(...args: Value<any>[]) {
        return args.map( valueOf )
    },

    FlatList(...args: Value<any>[]) {
        return flatten(args.map( valueOf ))
    },

    Range(startVal: Value<number | null>, endVal: Value<number | null>, stepVal: Value<number | null> = 1): number[] {
        if (arguments.length < 2) {
            throw Error('Range() needs start and end, and optional step')
        }

        const start = valueOf(startVal) ?? 0, end = valueOf(endVal) ?? 0, step = valueOf(stepVal)
        const checkNumber = (n: number, name: string) => {if (n === Infinity || isNaN(n)) throw Error(`Range: ${name} cannot be ${n}`)}
        checkNumber(start, 'start')
        checkNumber(end, 'end')
        if (isNil(step) || step === 0 || step === Infinity || isNaN(step)) {
            throw Error('Range: step cannot be ' + step)
        }
        const ascending = start < end
        const stepDirection = ascending ? 1 : -1
        const result: number[] = []
        const isFinished = (i: number) => ascending ? i > end : i < end
        for (let i = start; !isFinished(i); i += Math.abs(step) * stepDirection) {
            result.push(i)
        }
        return result
    },

    ListContains(listVal: Value<any[]>, searchVal: Value<any>) {
        if (arguments.length < 2) throw new Error('Wrong number of arguments to ListContains. Expected list, item.')
        const list = valueOf(listVal) ?? []
        const search = valueOf(searchVal)
        return list.some( it => equals(it, search))
    },

    Select(list: Value<any[]> | null, condition: (item: any, index: number) => boolean) {
        const listVal = valueOf(list) ?? []
        if (condition === undefined) throw new Error('Wrong number of arguments to Select. Expected list, expression.')
        return listVal.filter(condition)
    },

    SelectFirst(list: Value<any[]> | null, condition: (item: any, index: number) => boolean = notEmpty) {
        const listVal = valueOf(list) ?? []
        if (arguments.length < 1) throw new Error('Wrong number of arguments to SelectFirst. Expected list, expression (optional).')
        return listVal.find(condition) ?? null
    },

    FirstNotNull(...args: Value<any>[]) {
        const argVals = valuesOf(...args)
        return argVals.find(notEmpty) ?? null
    },

    Count(listVal: Value<any[]> | null, condition?: (item: any, index: number) => boolean) {
        const list = valueOf(listVal)
        if (arguments.length < 1) throw new Error('Wrong number of arguments to Count. Expected list, optional expression.')
        if (isNil(list)) return 0
        return condition ? list.filter(condition!).length : list.length
    },

    ForEach(listVal: Value<any[] | object> | null, transform: ForEachTransform) {
        const list = valueOf(listVal) ?? []
        if (transform === undefined) throw new Error('Wrong number of arguments to ForEach. Expected list, expression.')
        if (isPlainObject(list)) {
            return Object.entries(list).map( ([key, item]) => (transform as ForEachObjectTransform)(item, key))
        }
        return (list as any[]).map(transform as ForEachArrayTransform)
    },

    First(listVal: Value<any[]> | null, condition: (item: any) => boolean = () => true) {
        if (listVal === undefined) throw new Error('Wrong number of arguments to First. Expected list, optional expression.')
        const list = valueOf(listVal) ?? []
        return list.filter(condition)[0] ?? null
    },

    Last(listVal: Value<any[]> | null, condition: (item: any) => boolean = () => true) {
        if (listVal === undefined) throw new Error('Wrong number of arguments to Last. Expected list, optional expression.')
        const list = valueOf(listVal) ?? []
        return last(list.filter(condition)) ?? null
    },

    ItemAt(listVal: Value<any[]> | null, index: Value<number>) {
        if (arguments.length < 2) throw new Error('Wrong number of arguments to ItemAt. Expected list, index.')
        return valueOf(listVal)?.[valueOf(index)] ?? null
    },

    ItemAfter(listVal: Value<any[]> | null, item: any) {
        if (arguments.length < 2) throw new Error('Wrong number of arguments to ItemAfter. Expected list, item.')
        return offsetItem(listVal, item, 1)
    },

    ItemBefore(listVal: Value<any[]> | null, item: any) {
        if (arguments.length < 2) throw new Error('Wrong number of arguments to ItemBefore. Expected list, item.')
        return offsetItem(listVal, item, -1)
    },

    FindIndex(listVal: Value<any[]> | null, itemVal: any) {
        if (arguments.length < 2) throw new Error('Wrong number of arguments to FindIndex. Expected list, item to find.')
        const [list, item] = valuesOf(listVal, itemVal)
        const index = list?.findIndex((it: any) => equals(it, item))
        return index >= 0 ? index : null
    },

    Sort(listVal: Value<any[] | null>, sortKeyFn: (item: any) => any | any[] = identity): any[] {
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

        const list = valueOf(listVal) ?? []
        return sort(compareItems, list)
    },

    GroupBy(listVal: Value<any[]> | null, keyFn: (item: any) => any) {
        const list = valueOf(listVal) ?? []
        if (keyFn === undefined) throw new Error('Wrong number of arguments to GroupBy. Expected list, expression.')
        return group(list, keyFn)
    },

    Reverse(listVal: Value<any[]> | null) {
        const list = valueOf(listVal) ?? []
        return reverse(list)
    },

    CommonItems(list1Val: Value<any[]> | null, list2Val: Value<any[]> | null) {
        const list1 = valueOf(list1Val) ?? [], list2 = valueOf(list2Val) ?? []
        return list1.filter( (x:any) => list2.includes(x))
    },

    HasSameItems(list1Val: Value<any[]> | null, list2Val: Value<any[]> | null) {
        const [list1, list2] = valuesOf(list1Val, list2Val)
        if (isNil(list1) || isNil(list2) ) return false
        return without(list1, list2).length == 0 && without(list2, list1).length == 0
    },

    WithoutItems(listVal: Value<any[]> | null, ...itemVals: Value<any>[]) {
        if (arguments.length < 1) throw new Error('Wrong number of arguments to WithoutItems. Expected list, items to exclude.')
        const list = valueOf(listVal) ?? [], items = valuesOf(...itemVals)
        const flatItems = flatten(items)
        return without(flatItems, list)
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

    Random(firstArg?: Value<number>, secondArg?: Value<number>) {
        const [firstArgVal, secondArgVal] = valuesOf(firstArg, secondArg)
        if (arguments.length === 0) {
            return Math.random()
        }
        const [lowerLimit, upperLimit] = arguments.length === 1 ? [0, firstArgVal] : [firstArgVal, secondArgVal]
        const range = upperLimit - lowerLimit + 1
        return lowerLimit + Math.floor(range * Math.random())
    },

    RandomFrom(firstArg: Value<any>, ...furtherArgs: Value<any>[]): any {
        const list = furtherArgs.length === 0 ? valueOf(firstArg) ?? [] : valuesOf(firstArg, ...furtherArgs)
        const randomIndex = Math.floor(list.length * Math.random())
        return list[randomIndex] ?? null
    },

    RandomListFrom(listVal: Value<any[]> | null, itemCountVal: Value<number> | null): any[] {
        const list = valueOf(listVal) ?? [], itemCount = valueOf(itemCountVal) ?? 0
        return shuffle(list).slice(0, itemCount)
    },

    Shuffle(listVal: Value<any[]> | null): any[] {
        const list = valueOf(listVal) ?? []
        return shuffle(list)
    },

    Check(condition: Value<any>, message: Value<string>) {
        const [conditionVal, messageVal] = valuesOf(condition, message)
        if (!conditionVal) {
            throw new ValidationError(messageVal)
        }
    },

    CsvToRecords(csvText: string | null, columnNames?: string[]) {
        if (isNil(csvText)) return []

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

// for each function, the arguments that should be functions, and the argument names of those functions OR lazy to evaluate the argument only when needed
export const functionArgs = {
    Select: {1: ['$item', '$index']},
    SelectFirst: {1: ['$item', '$index']},
    Count: {1: ['$item', '$index']},
    ForEach: {1: ['$item', '$index']},
    First: {1: ['$item']},
    Last: {1: ['$item']},
    Sort: {1: ['$item']},
    GroupBy: {1: ['$item']},
    If: {1: 'lazy', 2: 'lazy'}
}
