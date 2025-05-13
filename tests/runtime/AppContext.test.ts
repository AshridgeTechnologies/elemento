import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import UrlContext, {DefaultUrlContext} from '../../src/runtime/UrlContext'
import {goBack, onUrlChange, pushUrl} from '../../src/runtime/navigationHelpers'

const resourceUrl = 'urls/from/here'

test.skip('DefaultAppContext gets data from browser history with all parts', () => {
    const urlContext = new DefaultUrlContext(null, resourceUrl)

    expect(urlContext.getUrl()).toStrictEqual({
        location: {
            origin: 'http://example.com:8090',
            pathname: '/Page1/abc/123',
            query: {a: '10', b: 'true', c: 'foo'},
            hash: 'things'

        },
        pathPrefix: null
    })
})

test.skip('DefaultAppContext gets data from window location with path prefix and removes trailing slash', () => {

    const urlContext = new DefaultUrlContext('theApp/somewhere/', resourceUrl)

    expect(urlContext.getUrl()).toStrictEqual({
        location: {
            origin: 'http://example.com:8090',
            pathname: '/Page1/abc/123',
            query: {},
            hash: ''

        },
        pathPrefix: 'theApp/somewhere'
    })
})

describe('getFullUrl', () => {
    test.skip('adjusts local urls for resource url', () => {
        const urlContext = new DefaultUrlContext(null, 'https://example.com:8090/theApp/somewhere')

        expect(urlContext.getFullUrl('/myImage.jpg')).toBe('https://example.com:8090/theApp/somewhere/myImage.jpg')
        expect(urlContext.getFullUrl('special/files/myImage.jpg')).toBe('https://example.com:8090/theApp/somewhere/special/files/myImage.jpg')
    })

    test.skip('adjusts local url for no resource url', () => {
        const urlContext: UrlContext = new DefaultUrlContext(null, undefined)

        expect(urlContext.getFullUrl('myImage.jpg')).toBe('/myImage.jpg')
        expect(urlContext.getFullUrl('/special/files/myImage.jpg')).toBe('/special/files/myImage.jpg')
    })

    test.skip('does not adjust external urls', () => {
        const urlContext: UrlContext = new DefaultUrlContext(null, 'https://example.com:8090/theApp/somewhere')
        expect(urlContext.getFullUrl('https://mysite.com/myImage.jpg')).toBe('https://mysite.com/myImage.jpg')
    })

    test.skip('does not adjust undefined urls', () => {
        const urlContext: UrlContext = new DefaultUrlContext(null, 'https://example.com:8090/theApp/somewhere')
        expect(urlContext.getFullUrl(undefined)).toBe(undefined)
    })

})

describe('updateUrl', () => {
    let urlContext: UrlContext

    beforeEach(() => {
        urlContext = new DefaultUrlContext(null, resourceUrl)
        urlContext.getUrl() //ensure url is cached before update
    })

    test.skip('does push on history with page only', () => {

        urlContext.updateUrl('/Page2/xyz', null, null)
        expect(urlContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {},
                hash: ''

            },
            pathPrefix: null
        })
    })

    test.skip('does push on history with page query', () => {

        urlContext.updateUrl('/Page2/xyz', {a: 10, b: true, c: 'Foo'}, null)
        expect(urlContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {a: '10', b: 'true', c: 'Foo'},
                hash: ''

            },
            pathPrefix: null
        })
    })

    test.skip('does push on history with page query and hash', () => {

        urlContext.updateUrl('/Page2/xyz', {a: 10, b: true, c: '2012-08-10'}, 'part1')
        expect(urlContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {a: '10', b: 'true', c: '2012-08-10'},
                hash: 'part1'

            },
            pathPrefix: null
        })
    })

    test.skip('does push on history with path prefix and hash', () => {

        const urlContext = new DefaultUrlContext('/theApp/somewhere', resourceUrl)

        urlContext.updateUrl('/Page2/xyz', null, 'part1')
        expect(urlContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {},
                hash: 'part1'

            },
            pathPrefix: '/theApp/somewhere'
        })
    })
})

test.skip('goBack goes back in browser history', () => {

    const urlContext = new DefaultUrlContext(null, resourceUrl)
    urlContext.getUrl() //ensure url is cached before update

    urlContext.updateUrl('/Page2/xyz', null, 'part1')
    expect(urlContext.getUrl().location.pathname).toBe('/Page2/xyz')
    goBack()
    expect(urlContext.getUrl().location.pathname).toBe('/Page1/abc')
})

describe('can subscribe and be notified of url changes', () => {
    test.skip('from external source', () => {
        const urlContext = new DefaultUrlContext(null, resourceUrl)
        urlContext.getUrl() //ensure url is cached before update

        const callback = vi.fn() as (url: string) => void
        onUrlChange( callback )

        pushUrl('/Page2/xyz?a=10&b=true&c=2012-08-10#part1')
        expect(callback).toHaveBeenCalledWith({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {a: '10', b: 'true', c: '2012-08-10'},
                hash: 'part1'

            },
            pathPrefix: null
        })
    })

    test.skip('from updateUrl', () => {
        const urlContext = new DefaultUrlContext(null, resourceUrl)
        urlContext.getUrl() //ensure url is cached before update

        const callback = vi.fn() as (url: string) => void
        onUrlChange( callback )

        urlContext.updateUrl('/Page2/xyz', {a: 10, b: true, c: '2012-08-10'}, 'part1')
        expect(callback).toHaveBeenCalledWith({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {a: '10', b: 'true', c: '2012-08-10'},
                hash: 'part1'

            },
            pathPrefix: null
        })
    })

    test.skip('can subscribe and unsubscribe', () => {
        const urlContext = new DefaultUrlContext(null, resourceUrl)
        urlContext.getUrl() //ensure url is cached before update

        const callback1 = vi.fn() as (url: string) => void
        const callback2 = vi.fn() as (url: string) => void
        const subscription1 = onUrlChange( callback1 )
        onUrlChange( callback2 )

        pushUrl('/Page2/xyz?a=10&b=true&c=2012-08-10#part1')
        expect(callback1).toHaveBeenCalled()
        expect(callback2).toHaveBeenCalled()

        subscription1.unsubscribe()
        pushUrl('/Page2/xyz?a=10&b=true&c=2012-08-10#part1')
        expect(callback1).toHaveBeenCalledTimes(1)
        expect(callback2).toHaveBeenCalledTimes(2)
    })
})

