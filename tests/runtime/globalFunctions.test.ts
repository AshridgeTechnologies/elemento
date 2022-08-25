import { Pending } from '../../src/runtime/DataStore'
import {globalFunctions} from '../../src/runtime/globalFunctions'
import {valObj} from '../testutil/testHelpers'

const {Sum, Log, If, Left, Mid, Right, And, Or, Not, Substitute, Max, Min,
    Record, List, Select, ForEach, First, Last, Sort,
    Timestamp, Now, Today, TimeBetween, DaysBetween, DateFormat, DateAdd,
    CsvToRecords} = globalFunctions
const {valueOf} = globalFunctions

const undefinedDate = undefined as unknown as Date
const nullDate = null as unknown as Date

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

describe('Select', () => {
    // @ts-ignore
    test('errors for no arguments', () => expect(() => Select()).toThrow('Wrong number of arguments to Select. Expected list, expression.'))
    test('returns the selected items', () => expect(Select([3, -1, 4, 0], (it: any) => it > 0)).toStrictEqual([3, 4]))
    test('Gets value of object for the list', ()=> expect(Select(valObj([3, -1, 4, 0]), (it: any) => it <= 0)).toStrictEqual([-1, 0]))
    // @ts-ignore
    test('Pending value gives empty list', ()=> expect(Select(new Pending(), (it: any) => it <= 0)).toStrictEqual([]))
})

describe('ForEach', () => {
    // @ts-ignore
    test('errors for no arguments', () => expect(() => ForEach()).toThrow('Wrong number of arguments to ForEach. Expected list, expression.'))
    test('returns the selected items', () => expect(ForEach([3, -1, 4, 0], (it: any) => it * 10)).toStrictEqual([30, -10, 40, 0]))
    test('Gets value of object for the list', ()=> expect(ForEach(valObj([3, -1]), (it: any) => it + ' times')).toStrictEqual(['3 times', '-1 times']))
    // @ts-ignore
    test('Pending value gives empty list', ()=> expect(ForEach(new Pending(), (it: any) => it + 10)).toStrictEqual([]))
})

describe('First', () => {
    // @ts-ignore
    test('errors for no arguments', () => expect(() => First()).toThrow('Wrong number of arguments to First. Expected list, optional expression.'))
    test('returns the first in the list without a condition', () => expect(First([3, -1, 4, 0])).toStrictEqual(3))
    test('returns the first selected item with a condition', () => expect(First([3, -1, 4, 0], (it: any) => it < 0)).toStrictEqual(-1))
    test('Gets value of object for the list', ()=> expect(First(valObj([3, -1, 4, 0]), (it: any) => it === 0)).toStrictEqual(0))
    // @ts-ignore
    test('Pending value gives null', ()=> expect(First(new Pending(), (it: any) => it <= 0)).toStrictEqual(null))
})

describe('Last', () => {
    // @ts-ignore
    test('errors for no arguments', () => expect(() => Last()).toThrow('Wrong number of arguments to Last. Expected list, optional expression.'))
    test('returns the last in the list without a condition', () => expect(Last([3, -1, 4, 0])).toStrictEqual(0))
    test('returns the last selected item with a condition', () => expect(Last([3, -1, 4, 0], (it: any) => it > 0)).toStrictEqual(4))
    test('Gets value of object for the list', ()=> expect(Last(valObj([3, -1, 4, 0]), (it: any) => it > 3)).toStrictEqual(4))
    // @ts-ignore
    test('Pending value gives null', ()=> expect(Last(new Pending(), (it: any) => it <= 0)).toStrictEqual(null))
})

describe('Sort', () => {
    test('sorts objects by a function that returns a single sort key', () => {
        const objects = [
            {id: 'id1', a: 'Sun', b: 30},
            {id: 'id2', a: 'Moon', b: 20},
            {id: 'id3', a: 'Stars', b: 100},
        ]
        const [obj1, obj2, obj3] = objects
        expect(Sort(objects, (item: any) => item.a)).toStrictEqual([obj2, obj3, obj1])
        expect(Sort(objects, (item: any) => item.b)).toStrictEqual([obj2, obj1, obj3])
    })

    test('sorts objects by a function that returns an array of sort keys', () => {
        const objects = [
            {id: 'id1', a: 'Sun', b: 30},
            {id: 'id2', a: 'Moon', b: 20},
            {id: 'id3', a: 'Sun', b: 100},
        ]
        const [obj1, obj2, obj3] = objects
        expect(Sort(objects, (item: any) => [item.a, item.b])).toStrictEqual([obj2, obj1, obj3])
    })

    test('sorts objects by dates and booleans', () => {
        const objects = [
            {id: 'id1', a: new Date(2022, 6, 2), b: true},
            {id: 'id2', a: new Date(2022, 6, 1), b: true},
            {id: 'id3', a: new Date(2022, 6, 2), b: false},
        ]
        const [obj1, obj2, obj3] = objects
        expect(Sort(objects, (item: any) => [item.a, item.b])).toStrictEqual([obj2, obj3, obj1])
    })

    test('sorts objects with undefined values', () => {
        const objects = [
            {id: 'id1', a: new Date(2022, 6, 2), b: true},
            {id: 'id2', a: undefined, b: true},
            {id: 'id3', a: new Date(2022, 6, 2), b: undefined},
            {id: 'id4', a: undefined, b: undefined},
        ]
        const [obj1, obj2, obj3, obj4] = objects
        const sortResult = Sort(objects, (item: any) => [item.a, item.b])
        expect(sortResult).toStrictEqual([obj4, obj2, obj3, obj1])
    })

    test('sorts objects with null values', () => {
        const objects = [
            {id: 'id1', a: -3, b: true},
            {id: 'id2', a: null, b: true},
            {id: 'id3', a: -3, b: null},
            {id: 'id4', a: null, b: null},
        ]
        const [obj1, obj2, obj3, obj4] = objects
        const sortResult = Sort(objects, (item: any) => [item.a, item.b])
        expect(sortResult).toStrictEqual([obj4, obj2, obj3, obj1])
    })

    test('uses valueOf the list argument', () => {
        const objects = [
            {id: 'id1', a: 'Sun', b: 30},
            {id: 'id2', a: 'Moon', b: 20},
            {id: 'id3', a: 'Stars', b: 10},
        ]
        const [obj1, obj2, obj3] = objects
        expect(Sort(valObj(objects), (item: any) => item.a)).toStrictEqual([obj2, obj3, obj1])
    })

    test('returns undefined or null list as is', () => {
        expect(Sort(undefined as unknown as any[], (item: any) => item.a)).toBe(undefined)
        expect(Sort(null as unknown as any[], (item: any) => item.a)).toBe(null)

    })
})

describe('Timestamp', function () {
    test('is close to current time', () => {
        const timestamp = Timestamp()
        const timeNow = Date.now()
        expect(timeNow).toBeGreaterThanOrEqual(timestamp)
        expect(timeNow - timestamp).toBeLessThan(5)
    })
})

describe('Now', function () {
    test('is close to current time', () => {
        const now = Now()
        expect(now).toBeInstanceOf(Date)
        const timeNow = Date.now()
        expect(timeNow).toBeGreaterThanOrEqual(now.getTime())
        expect(timeNow - now.getTime()).toBeLessThan(100)
    })
})

describe('Today', function () {
    test('is the UTC date for the year,month,day of the previous midnight from current time in current time zone', () => {
        const currentDate = new Date()
        const today = Today() as unknown as Date
        expect(today).toBeInstanceOf(Date)

        expect(today.getUTCFullYear()).toBe(currentDate.getFullYear())
        expect(today.getUTCMonth()).toBe(currentDate.getMonth())
        expect(today.getUTCDay()).toBe(currentDate.getDay())
        expect(today.getUTCHours()).toBe(0)
        expect(today.getUTCMinutes()).toBe(0)
        expect(today.getUTCSeconds()).toBe(0)
    })

    test.each([
        [2022, 6, 1, 0, 0, 0],
        [2022, 6, 1, 23, 59, 59],
    ])('is the UTC date for the year,month,day of the previous midnight from a date in current time zone', (year, month, date, hour, minute, second) => {
        const currentDate = new Date(year, month, date, hour, minute, second)
        const today = Today(currentDate) as unknown as Date
        expect(today).toBeInstanceOf(Date)

        expect(today.getUTCFullYear()).toBe(year)
        expect(today.getUTCMonth()).toBe(month)
        expect(today.getUTCDate()).toBe(date)
        expect(today.getUTCHours()).toBe(0)
        expect(today.getUTCMinutes()).toBe(0)
        expect(today.getUTCSeconds()).toBe(0)
    })
})

describe('TimeBetween', () => {

    const date = new Date(2021, 6, 1, 10, 10, 10)
    const datePlus10secs = new Date(2021, 6, 1, 10, 10, 20)
    const datePlus1Hour10secs = new Date(2021, 6, 1, 11, 10, 20)
    const datePlus2Days1Minute = new Date(2021, 6, 3, 10, 11, 10)
    const datePlus2Years1Day = new Date(2023, 6, 2, 10, 10, 10)

    test('two dates in seconds', () => {
        expect(TimeBetween(date, datePlus1Hour10secs, 'seconds')).toBe(3610)
        expect(TimeBetween(datePlus1Hour10secs, date, 'seconds')).toBe(-3610)
    })

    test('two dates in minutes', () => {
        expect(TimeBetween(date, datePlus1Hour10secs, 'minutes')).toBe(60)
        expect(TimeBetween(datePlus1Hour10secs, date, 'minutes')).toBe(-60)
    })

    test('two dates in hours', () => {
        expect(TimeBetween(date, datePlus10secs, 'hours')).toBe(0)
        expect(TimeBetween(date, datePlus1Hour10secs, 'hours')).toBe(1)
        expect(TimeBetween(datePlus1Hour10secs, date, 'hours')).toBe(-1)
        expect(TimeBetween(date, datePlus2Days1Minute, 'hours')).toBe(48)
        expect(TimeBetween(datePlus2Days1Minute, date, 'hours')).toBe(-48)
    })

    test('two dates in days', () => {
        expect(TimeBetween(date, datePlus10secs, 'days')).toBe(0)
        expect(TimeBetween(date, datePlus1Hour10secs, 'days')).toBe(0)
        expect(TimeBetween(date, datePlus2Days1Minute, 'days')).toBe(2)
        expect(TimeBetween(datePlus2Days1Minute, date, 'days')).toBe(-2)
    })

    test('two dates in months', () => {
        expect(TimeBetween(date, datePlus2Days1Minute, 'months')).toBe(0)
        expect(TimeBetween(date, datePlus2Years1Day, 'months')).toBe(24)
        expect(TimeBetween(datePlus2Years1Day, date, 'months')).toBe(-24)
    })

    test('two dates in years', () => {
        expect(TimeBetween(date, datePlus2Days1Minute, 'years')).toBe(0)
        expect(TimeBetween(date, datePlus2Years1Day, 'years')).toBe(2)
        expect(TimeBetween(datePlus2Years1Day, date, 'years')).toBe(-2)
    })

    test('exception for invalid unit', () => {
        expect(()=> TimeBetween(new Date(), new Date(), 'millis' as any)).toThrow('Unknown unit millis.  Should be one of seconds, minutes, hours, days, months, years')
    })

    test('undefined result if either date is undefined or null', () => {
        expect(TimeBetween(date, undefinedDate, 'years')).toBe(undefined)
        expect(TimeBetween(date, nullDate, 'years')).toBe(undefined)
        expect(TimeBetween(undefinedDate, date, 'years')).toBe(undefined)
        expect(TimeBetween(nullDate, date, 'years')).toBe(undefined)
    })

    test('uses valueOf arguments', () => {
        expect(TimeBetween(valObj(datePlus2Years1Day), valObj(date), valObj('years'))).toBe(-2)

    })
})

describe('DaysBetween', () => {

    const day1_midnight = new Date(2021, 6, 1, 0, 0, 0)
    const day1_0100 = new Date(2021, 6, 1, 1, 0, 0)
    const day1_2300 = new Date(2021, 6, 1, 23, 0, 0)
    const day3_midnight = new Date(2021, 6, 3, 0, 0, 0)
    const day3_0100 = new Date(2021, 6, 3, 1, 0, 0)

    test('days between is calendar days', () => {
        expect(DaysBetween(day1_midnight, day1_midnight)).toBe(0)
        expect(DaysBetween(day1_midnight, day1_2300)).toBe(0)
        expect(DaysBetween(day1_0100, day1_2300)).toBe(0)
        expect(DaysBetween(day1_midnight, day3_midnight)).toBe(2)
        expect(DaysBetween(day1_midnight, day3_0100)).toBe(2)
        expect(DaysBetween(day1_2300, day3_0100)).toBe(2)
        expect(DaysBetween(day3_0100, day1_0100)).toBe(-2)
    })

    test('undefined result if either date is undefined or null', () => {
        expect(DaysBetween(day1_midnight, undefinedDate)).toBe(undefined)
        expect(DaysBetween(day1_midnight, nullDate)).toBe(undefined)
        expect(DaysBetween(undefinedDate, day1_midnight)).toBe(undefined)
        expect(DaysBetween(nullDate, day1_midnight)).toBe(undefined)
    })

    test('uses valueOf arguments', () => {
        expect(DaysBetween(valObj(day1_midnight), valObj(day3_midnight))).toBe(2)
    })
})

describe('DateAdd', () => {
    const date = new Date(2021, 6, 1, 10, 11, 12)
    expect(DateAdd(date, 3, 'seconds')).toStrictEqual(new Date(2021, 6, 1, 10, 11, 15))
    expect(DateAdd(date, -3, 'minutes')).toStrictEqual(new Date(2021, 6, 1, 10, 8, 12))
    expect(DateAdd(date, 3, 'hours')).toStrictEqual(new Date(2021, 6, 1, 13, 11, 12))
    expect(DateAdd(date, -3, 'days')).toStrictEqual(new Date(2021, 5, 28, 10, 11, 12))
    expect(DateAdd(date, 3, 'months')).toStrictEqual(new Date(2021, 9, 1, 10, 11, 12))
    expect(DateAdd(date, -3, 'years')).toStrictEqual(new Date(2018, 6, 1, 10, 11, 12))

    expect(() => DateAdd(date, 42, 'lightyears' as any)).toThrow()

    test('undefined or null arguments give undefined', () => {
        expect(DateAdd(undefinedDate, -3, 'years')).toBeUndefined()
        expect(DateAdd(nullDate, -3, 'years')).toBeUndefined()
        expect(DateAdd(date, undefined as unknown as number, 'years')).toBeUndefined()
        expect(DateAdd(date, null as unknown as number, 'years')).toBeUndefined()

    })

    test('uses valueOf arguments', () => {
        expect(DateAdd(valObj(date), valObj(-3), valObj('years'))).toStrictEqual(new Date(2018, 6, 1, 10, 11, 12))
    })
})

describe('DateFormat', () => {
    const date = new Date(2021, 6, 1, 20, 5, 11)

    test('formats date with custom string', () => {
        expect(DateFormat(date, 'HH:mm:ss')).toBe('20:05:11')
    })

    test('formats date from object value', () => {
        expect(DateFormat(valObj(date), 'HH:mm:ss')).toBe('20:05:11')
    })

    test('formats null or undefined as empty string', () => {
        expect(DateFormat(undefinedDate, 'HH:mm:ss')).toBe('')
        expect(DateFormat(nullDate, 'HH:mm:ss')).toBe('')
    })
})

describe('CsvToRecords', () => {
    test('converts csv to records using given column names converted to start case and using lower-case id', () => {
        const csvText = `id1,First Widget,27\n`
                        + `id2,"Widget, again",32`
        const records = CsvToRecords(csvText, ['Id', 'Description', 'Overall Height'])
        expect(records).toStrictEqual([
            {id: 'id1', Description: 'First Widget', OverallHeight: 27},
            {id: 'id2', Description: 'Widget, again', OverallHeight: 32},
        ])
    })

    test('converts csv to records using start case column names from first line and ignores blank lines or all empty lines and uses lower case id', () => {
        const csvText = `Id,Description,Overall Height\n`
                        + '\n'
                        + `id1,First Widget,27\n`
                        + `\n`
                        + `,,,,,,,,,,\n`
                        + `id2,"Widget, again",32`
        const records = CsvToRecords(csvText)
        expect(records).toStrictEqual([
            {id: 'id1', Description: 'First Widget', OverallHeight: 27},
            {id: 'id2', Description: 'Widget, again', OverallHeight: 32},
        ])
    })

    test('converts csv to records using appropriate field types and allows quotes in fields and trims all fields', () => {
        const csvText = `id,Description,Height,IsShiny,FirstUsed\n`
                        + `id1,First "Widget"'s Description,27,true,2022-07-14T08:15:35.607Z\n`
                        + `id2,"Widget, again","32",false,2022-07-14\n`
                        + `id3,  Widget three  , 32 ,"true", 2022-07-32 \n` // invalid date
                        + `id4," Widget 2 ","32","false","2022-07-14T08:15:35.607Z"\n`
                        + `id5," Widget 5",45.67,TRUE,2022-07-14 08:15:35\n`
        const records = CsvToRecords(csvText)
        expect(records).toStrictEqual([
            {id: 'id1', Description: 'First "Widget"\'s Description', Height: 27, IsShiny: true, FirstUsed: new Date(Date.parse('2022-07-14T08:15:35.607Z'))},
            {id: 'id2', Description: 'Widget, again', Height: 32, IsShiny: false, FirstUsed: new Date(2022, 6, 14)},
            {id: 'id3', Description: 'Widget three', Height: 32, IsShiny: true, FirstUsed: '2022-07-32'},
            {id: 'id4', Description: 'Widget 2', Height: 32, IsShiny: false, FirstUsed: new Date(Date.parse('2022-07-14T08:15:35.607Z'))},
            {id: 'id5', Description: 'Widget 5', Height: 45.67, IsShiny: true, FirstUsed: new Date(2022, 6, 14, 8, 15, 35)},
        ])
    })

    test('allows short lines long lines and empty column values', () => {
        const csvText = `id1,First Widget,27,,34\n`
            + `id2,"Widget, again",32,66\n`
            + `id3,"Widget 3",,,,,,,,,`
        const records = CsvToRecords(csvText, ['id', 'Description', 'Overall Height', 'Min Width', 'Max Depth'])
        expect(records).toStrictEqual([
            {id: 'id1', Description: 'First Widget', OverallHeight: 27, MaxDepth: 34},
            {id: 'id2', Description: 'Widget, again', OverallHeight: 32, MinWidth: 66},
            {id: 'id3', Description: 'Widget 3'},
        ])

    })

    test('uses Tabs if found in all the lines', () => {
        const csvText = `id1\t"First\tWidget"\t27\t\t34\n`
            + `id2\tWidget, again\t32\t66\n`
            + `id3\t"Widget 3"`
        const records = CsvToRecords(csvText, ['Id', 'Description', 'Overall Height', 'Min Width', 'Max Depth'])
        expect(records).toStrictEqual([
            {id: 'id1', Description: 'First\tWidget', OverallHeight: 27, MaxDepth: 34},
            {id: 'id2', Description: 'Widget, again', OverallHeight: 32, MinWidth: 66},
            {id: 'id3', Description: 'Widget 3'},
        ])

        const csvTextWithTabNotAsDelimiter = `id1,First\tWidget,27,,34\n`
            + `id2,"Widget\tagain",32,66\r\n`
            + `id3,"Widget 3 no tab in this line"`

        const records2 = CsvToRecords(csvTextWithTabNotAsDelimiter, ['Id', 'Description', 'Overall Height', 'Min Width', 'Max Depth'])
        expect(records2).toStrictEqual([
            {id: 'id1', Description: 'First\tWidget', OverallHeight: 27, MaxDepth: 34},
            {id: 'id2', Description: 'Widget\tagain', OverallHeight: 32, MinWidth: 66},
            {id: 'id3', Description: 'Widget 3 no tab in this line'},
        ])

    })

})