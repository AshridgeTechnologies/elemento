import {isObject} from 'lodash'

type Value<T> = T | {valueOf: () => T }

function valueOf<T>(x: Value<T>) : T {
    return isObject(x) ? x.valueOf() : x
}

export const globalFunctions = {
    valueOf,

    Sum(...args: Value<number>[]) {
        return args.reduce( (acc, val) => (acc as number) + (val as number), 0)
    },

    Log(...args: any[]) {
        console.log(...args)
    },

    If(condition: any, trueValue: any, falseValue?: any) {
        return !!valueOf(condition) ? trueValue : falseValue
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
    }
}