import {isNumeric, isoDateReviver, previewPathComponents, wordAtPosition} from '../../src/util/helpers'

test('isNumeric gives correct result for all strings', () => {
     expect(isNumeric('a')).toBe(false)
     expect(isNumeric('abc')).toBe(false)
     expect(isNumeric('abc12')).toBe(false)
     expect(isNumeric('12abc')).toBe(false)
     expect(isNumeric('')).toBe(false)
     expect(isNumeric('0')).toBe(true)
     expect(isNumeric('1')).toBe(true)
     expect(isNumeric('12')).toBe(true)
     expect(isNumeric('12.')).toBe(true)
     expect(isNumeric('12.89')).toBe(true)
     expect(isNumeric('.89')).toBe(true)
})

test('previewPathComponents extracts parts of pathname of studio preview url', () => {
    expect(previewPathComponents('/version')).toBe(null)
    expect(previewPathComponents('/version/xyz/123')).toBe(null)
    expect(previewPathComponents('/studio/preview/project-123/MainApp')).toStrictEqual({projectId: 'project-123', appName: 'MainApp'})
    expect(previewPathComponents('/studio/preview/project-123/MainApp/')).toStrictEqual({projectId: 'project-123', appName: 'MainApp'})
    expect(previewPathComponents('/studio/preview/project-123/MainApp/MainPage')).toStrictEqual({projectId: 'project-123', appName: 'MainApp', pageName: 'MainPage'})
    expect(previewPathComponents('/studio/preview/project-123/MainApp/MainApp.js')).toStrictEqual({projectId: 'project-123', appName: 'MainApp', filepath: 'MainApp.js'})
})

test('previewPathComponents extracts parts of pathname of studio preview tools url', () => {
    expect(previewPathComponents('/studio/preview/project-123/tools/Tool1')).toStrictEqual({projectId: 'project-123', appName: 'Tool1', prefix: 'tools/'})
    expect(previewPathComponents('/studio/preview/project-123/tools/Tool1/')).toStrictEqual({projectId: 'project-123', appName: 'Tool1', prefix: 'tools/'})
    expect(previewPathComponents('/studio/preview/project-123/tools/Tool1/MainPage')).toStrictEqual({projectId: 'project-123', appName: 'Tool1', prefix: 'tools/', pageName: 'MainPage'})
    expect(previewPathComponents('/studio/preview/project-123/tools/Tool1/MainApp.js')).toStrictEqual({projectId: 'project-123', appName: 'Tool1', prefix: 'tools/', filepath: 'MainApp.js'})
})

test('isoDateReviver parses only valid ISO dates', () => {
    expect(isoDateReviver('x1', 'abc')).toBe('abc')
    expect(isoDateReviver('x1', 20)).toBe(20)
    expect(isoDateReviver('x1', '32')).toBe('32')  // date-fns parseIso treats this as a date
    expect(isoDateReviver('x1', '2020-04-03T11:12:13')).toStrictEqual(new Date('2020-04-03T11:12:13'))
    expect(isoDateReviver('x1', '2020-13-03T11:12:13')).toStrictEqual('2020-13-03T11:12:13')
})

test('wordAtPosition finds word at given position or empty string', () => {
    expect(wordAtPosition('xyz', 0)).toBe('xyz')
    expect(wordAtPosition('xyz', 1)).toBe('xyz')
    expect(wordAtPosition('xyz abc', 0)).toBe('xyz')
    expect(wordAtPosition('xyz abc', 1)).toBe('xyz')
    expect(wordAtPosition('xyz abc', 4)).toBe('abc')
    expect(wordAtPosition('xyz abc', 5)).toBe('abc')
    expect(wordAtPosition('xyz abc', 7)).toBe('abc')

    expect(wordAtPosition('  xyz.abc', 0)).toBe('')
    expect(wordAtPosition('  xyz.abc', 1)).toBe('')
    expect(wordAtPosition('  xyz.abc', 2)).toBe('xyz')

    expect(wordAtPosition('  xyz.abc  ', 0)).toBe('')
    expect(wordAtPosition('  xyz.abc  ', 1)).toBe('')
    expect(wordAtPosition('  xyz.abc  ', 2)).toBe('xyz')
    expect(wordAtPosition('  xyz.abc  ', 4)).toBe('xyz')
    expect(wordAtPosition('  xyz.abc  ', 5)).toBe('xyz')
    expect(wordAtPosition('  xyz.abc  ', 6)).toBe('abc')
    expect(wordAtPosition('  xyz.abc  ', 8)).toBe('abc')
    expect(wordAtPosition('  xyz.abc  ', 9)).toBe('abc')
    expect(wordAtPosition('  xyz.abc  ', 10)).toBe('')
    expect(wordAtPosition('  xyz.abc  ', 11)).toBe('')
    expect(wordAtPosition('  xyz.abc  ', 12)).toBe('')
})
