import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import Url from '../../src/runtime/Url'

describe('page', () => {
    test('gets page from only path segment after app name', ()=> {
        const url = new Url('http://example.com', 'TheApp/MainPage', null, {})
        expect(url.page).toBe('MainPage')
    })

    test('gets page from only path segment after app name with path prefix', ()=> {
        const url = new Url('http://example.com', 'TheApp/MainPage', '/somewhere', {})
        expect(url.page).toBe('MainPage')
    })

    test('gets page from first path segment after app name', ()=> {
        const url = new Url('http://example.com', 'TheApp/MainPage/Tab1/12345', null, {})
        expect(url.page).toBe('MainPage')
    })

    test('gets null page from empty path segment after app name', ()=> {
        const url = new Url('http://example.com', '/', null, {})
        expect(url.page).toBe(null)
    })
})

describe('path segments', () => {
    test('gets empty path segments if only have page', ()=> {
        const url = new Url('http://example.com', 'MainPage', null, {})
        expect(url.pathSections).toStrictEqual([])
    })

    test('gets empty path segments if only have page with path prefix', ()=> {
        const url = new Url('http://example.com', '/MainPage', '/somewhere', {})
        expect(url.pathSections).toStrictEqual([])
    })

    test('gets path segments after page', ()=> {
        const url = new Url('http://example.com', 'TheApp/MainPage/Tab1/12345', null, {})
        expect(url.pathSections).toStrictEqual(['Tab1', '12345'])
    })

    test('gets empty path segments if no path', ()=> {
        const url = new Url('http://example.com', '/somewhere/TheApp', 'somewhere', {})
        expect(url.pathSections).toStrictEqual([])
    })
})

describe('query', () => {
    test('gets query with best guess type conversions', () => {
        const url = new Url('http://example.com', '/MainPage', null, {
            foo: 'bar',
            count: '22',
            isGood: 'true',
            gmtDate: '2023-11-22T09:10:11',
            summerDate: '2023-06-22',
            isoDate: '2022-11-03T08:30:48.353Z',
            isoSummerDate: '2022-06-03T08:30:48.353Z'
        })

        expect(url.query).toStrictEqual({
            foo: 'bar',
            count: 22,
            isGood: true,
            gmtDate: new Date(2023, 10, 22, 9, 10, 11),
            summerDate: new Date(2023, 5, 22, 0, 0, 0),
            isoDate: new Date(2022, 10, 3, 8, 30, 48, 353),
            isoSummerDate: new Date(2022, 5, 3, 9, 30, 48, 353)
        })
    })
})

test('gets anchor', () => {
    expect(new Url('http://example.com', '', null, {}).anchor).toBe(null)
    expect(new Url('http://example.com', '', null, {}, '#id123').anchor).toBe('id123')
    expect(new Url('http://example.com', '', null, {}, 'id123').anchor).toBe('id123')
})

test('gets previous marker', () => {
    expect(new Url('http://example.com', '').previous).toBe(Url.previous)
})

test('gets full url as text', () => {
    expect(new Url('http://example.com', '').text).toBe('http://example.com/')
    expect(new Url('http://example.com', '/').text).toBe('http://example.com/')
    expect(new Url('http://example.com', '/APage').text).toBe('http://example.com/APage')
    expect(new Url('http://example.com', '/APage', 'somewhere').text).toBe('http://example.com/somewhere/APage')
    expect(new Url('http://example.com', '/APage', '/somewhere').text).toBe('http://example.com/somewhere/APage')
    expect(new Url('http://example.com', '/APage/thing/widget', '/somewhere').text).toBe('http://example.com/somewhere/APage/thing/widget')
    expect(new Url('http://example.com', '/APage', null, {a: 'foo', b: 20, c: true}).text).toBe('http://example.com/APage?a=foo&b=20&c=true')
    expect(new Url('http://example.com', '/APage', 'somewhere', {a: '2022-06-06T07:08:09Z'}).text).toBe('http://example.com/somewhere/APage?a=2022-06-06T07:08:09Z')
    expect(new Url('http://example.com', '/APage', null, {}, 'id123').text).toBe('http://example.com/APage#id123')
    expect(new Url('http://example.com', '/APage', '/somewhere', {a: 'foo', b: 20}, 'id123').text).toBe('http://example.com/somewhere/APage?a=foo&b=20#id123')
})
