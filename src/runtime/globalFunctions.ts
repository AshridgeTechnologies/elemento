import {fromPairs, splitEvery} from 'ramda'
import {
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInMonths,
    differenceInSeconds, differenceInYears, differenceInCalendarDays
} from 'date-fns'
import {Value, valueOf} from './runtimeFunctions'

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

    Timestamp() {
        return Date.now()
    },

    Now() {
        return new Date()
    },

    Today(date = new Date()) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() ))
    },

    TimeBetween(date1: Date, date2: Date, unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'): number {
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

    DaysBetween(date1: Date, date2: Date) {
        return differenceInCalendarDays(date2, date1)
    }
}