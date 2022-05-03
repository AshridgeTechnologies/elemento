import {globalFunctions} from '../../src/runtime/globalFunctions'
import {valObj} from '../testutil/testHelpers'

const {Sum, Log, If, Left, Mid, Right, And, Or, Not, Substitute, Max, Min, Record, List} = globalFunctions
const {valueOf} = globalFunctions

describe('valueOf', () => {
    test('gets valueOf from an object with a specific valueOf', () => expect(valueOf(valObj(10))).toBe(10))
    test('returns an object with no specific valueOf', () => {
        const obj = {a: 10}
        expect(valueOf(obj)).toBe(obj)
    })

    test.each([10])('returns the same value for primitives', (x: any) => expect(valueOf(x)).toBe(x))
})

describe('Sum', () => {
    test('adds all arguments or zero if empty', ()=> {
        expect(Sum(1,2,3)).toBe(6)
        expect(Sum()).toBe(0)
    })

    test('uses valueOf all arguments', ()=> {
        const obj = valObj(10)
        expect(Sum(obj,2,obj)).toBe(22)
    })

    test('concatenates string arguments with a leading zero', ()=> {
        // @ts-ignore
        expect(Sum("aa", 10, "bb")).toBe("0aa10bb")
    })

})

describe('Log', () => {
    test('writes all arguments to console', () => {
        const log = jest.spyOn(console, "log").mockImplementation(() => {})
        const anObj = valObj(10)
        try {
            Log('This is what I did', 'today', anObj)
            expect(log).toBeCalledWith('This is what I did', 'today', anObj)

        } finally {
            log.mockReset();
        }
    })

})

describe('If', () => {
    test('with condition and one argument returns the argument if condition true', () => expect(If(true, 'Yes')).toBe('Yes'))
    test('with condition and two arguments returns the argument if condition truthy', () => expect(If('X', 'Yes', 'No')).toBe('Yes'))
    test('with condition and one argument returns undefined if condition false', () => expect(If(false, 'Yes')).toBeUndefined())
    test('with condition and two argument returns second argument if condition falsy', () => expect(If(0, 'Yes', 'No')).toBe('No'))
    test('uses valueOf for condition but returns other objects as they are', () => {
        const conditionTrue = valObj(true)
        const conditionFalse = valObj(false)
        const yes = valObj('yes')
        const no = valObj('no')
        expect(If(conditionTrue, yes, no)).toBe(yes)
        expect(If(conditionFalse, yes, no)).toBe(no)
    })
})

describe('Left', () => {
    test('Gets an empty string for negative length', ()=> expect(Left('abc', -1)).toBe(''))
    test('Gets an empty string for zero length', ()=> expect(Left('abc', 0)).toBe(''))
    test('Gets a part string for non-zero length', ()=> expect(Left('abc', 2)).toBe('ab'))
    test('Gets whole string for length same as string length', ()=> expect(Left('abc', 3)).toBe('abc'))
    test('Gets whole string for length greater than string length', ()=> expect(Left('abc', 4)).toBe('abc'))
    test('Gets value of objects', ()=> expect(Left(valObj('abc'), valObj(2))).toBe('ab'))
})

describe('Mid', () => {
    test('Errors for negative start', ()=> expect(() => Mid('abc', -1)).toThrow('Function Mid parameter 2 (start) is -1. It should be greater than or equal to 1.'))
    test('Errors for zero start', ()=> expect(() => Mid('abc', 0)).toThrow('Function Mid parameter 2 (start) is 0. It should be greater than or equal to 1.'))
    test('Errors for negative length', ()=> expect(() => Mid('abc', 1, -1)).toThrow('Function Mid parameter 3 (length) is -1. It should be greater than or equal to 0.'))
    test('Gets an empty string for 1 start, zero length', ()=> expect(Mid('abc', 1, 0)).toBe(''))
    test('Gets a part string for 1 start, non-zero length', ()=> expect(Mid('abc', 1, 2)).toBe('ab'))
    test('Gets whole string for 1 start, undefined length', ()=> expect(Mid('abc', 1)).toBe('abc'))
    test('Gets whole string for 1 start, length same as string length', ()=> expect(Mid('abc', 1, 3)).toBe('abc'))
    test('Gets a part string for 2 start, length less than string length', ()=> expect(Mid('abcdefg', 2, 3)).toBe('bcd'))
    test('Gets a part string for 2 start, length greater than string length', ()=> expect(Mid('abc', 2, 4)).toBe('bc'))
    test('Gets a part string for 2 start, undefined length', ()=> expect(Mid('abc', 2)).toBe('bc'))
    test('Gets value of objects', ()=> expect(Mid(valObj('abcdef'), valObj(2), valObj(3))).toBe('bcd'))
    test('Gets value of objects', ()=> expect(Mid(valObj('abcdef'), valObj(2))).toBe('bcdef'))
})

describe('Right', () => {
    test('Gets an empty string for negative length', ()=> expect(Right('abc', -1)).toBe(''))
    test('Gets an empty string for zero length', ()=> expect(Right('abc', 0)).toBe(''))
    test('Gets a part string for non-zero length', ()=> expect(Right('abc', 2)).toBe('bc'))
    test('Gets whole string for length same as string length', ()=> expect(Right('abc', 3)).toBe('abc'))
    test('Gets whole string for length greater than string length', ()=> expect(Right('abc', 4)).toBe('abc'))
    test('Gets value of objects', ()=> expect(Right(valObj('abc'), valObj(2))).toBe('bc'))
})

describe('And', () => {
    test('False for single falsy argument', ()=> expect(And(0)).toBe(false))
    test('True for single truthy argument', ()=> expect(And('abc')).toBe(true))
    test('False for three falsy arguments', ()=> expect(And(0, false, null)).toBe(false))
    test('False for one truthy argument and two falsy arguments', ()=> expect(And(false, true, '')).toBe(false))
    test('True for two truthy arguments', ()=> expect(And('abc', true)).toBe(true))
    test('Gets value of objects if false', ()=> expect(And(valObj(false), valObj(true))).toBe(false))
    test('Gets value of objects if true', ()=> expect(And(valObj(true), valObj(true))).toBe(true))
})

describe('Or', () => {
    test('False for single falsy argument', ()=> expect(Or(0)).toBe(false))
    test('True for single truthy argument', ()=> expect(Or('abc')).toBe(true))
    test('False for three falsy arguments', ()=> expect(Or(0, false, null)).toBe(false))
    test('True for one truthy argument and two falsy arguments', ()=> expect(Or(false, true, '')).toBe(true))
    test('True for two truthy arguments', ()=> expect(Or('abc', true)).toBe(true))
    test('Gets value of objects if false', ()=> expect(Or(valObj(false), valObj(false))).toBe(false))
    test('Gets value of objects if true', ()=> expect(Or(valObj(true), valObj(false))).toBe(true))
})

describe('Not', () => {
    test('true for falsy argument', ()=> expect(Not(0)).toBe(true))
    test('false for truthy argument', ()=> expect(Not('xx')).toBe(false))
    test('Gets value of object if false', ()=> expect(Not(valObj(false))).toBe(true))
    test('Gets value of object if true', ()=> expect(Not(valObj(true))).toBe(false))
})

describe('Substitute', () => {
    test('returns same string if string to replace is empty', () => expect(Substitute('abcde', '', 'xx')).toBe('abcde'))
    test('returns same string if string to replace is not found', () => expect(Substitute('abcde', 'pq', 'xx')).toBe('abcde'))
    test('replaces single occurrence if string to replace is found', () => expect(Substitute('abcde', 'pq', 'xx')).toBe('abcde'))
    test('replaces all occurrences if string to replace is found multiple times', () => expect(Substitute('abcdeffdeggde', 'de', 'xx')).toBe('abcxxffxxggxx'))
    test('Gets value of objects', ()=> expect(Substitute(valObj('abcdeffdeggde'), valObj('de'), valObj('xx'))).toBe('abcxxffxxggxx'))
})

describe('Max', () => {
    test('errors for no arguments', () => expect(() => Max()).toThrow('Wrong number of arguments to Max. Expected at least 1 argument.'))
    test('returns the argument for single argument', () => expect(Max(3)).toBe(3))
    test('returns the max argument for multiple arguments', () => expect(Max(3, -1, 4, 0)).toBe(4))
    test('Gets value of objects', ()=> expect(Max(valObj(3), valObj(2))).toBe(3))

})

describe('Min', () => {
    test('errors for no arguments', () => expect(() => Min()).toThrow('Wrong number of arguments to Min. Expected at least 1 argument.'))
    test('returns the argument for single argument', () => expect(Min(3)).toBe(3))
    test('returns the min argument for multiple arguments', () => expect(Min(3, -1, 4, 0)).toBe(-1))
    test('Gets value of objects', ()=> expect(Min(valObj(3), valObj(2))).toBe(2))
})

describe('Record', () => {
    test('errors for uneven number of arguments', ()=> expect( () => Record('x')).toThrow('Odd number of arguments - must have pairs of name, value'))
    test('returns an empty object for no arguments', ()=> expect(Record()).toStrictEqual({}))
    test('returns an object for pairs of arguments', ()=> expect(Record('a', 10, 'b', 'Bee')).toStrictEqual({a: 10, b: 'Bee'}))
    test('gets value of objects', ()=> expect(Record(valObj('c'), valObj(2))).toStrictEqual({c: 2}))
})

describe('List', () => {
    test('returns an empty list for no arguments', ()=> expect(List()).toStrictEqual([]))
    test('returns a list from the arguments', ()=> expect(List('a', 10, true, 'Bee')).toStrictEqual(['a', 10, true, 'Bee']))
    test('gets value of objects', ()=> expect(List(valObj('c'), valObj(2))).toStrictEqual(['c', 2]))
})
