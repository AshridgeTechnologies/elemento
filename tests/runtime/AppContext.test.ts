import AppContext, {DefaultAppContext} from '../../src/runtime/AppContext'
import {goBack, onUrlChange, pushUrl} from '../../src/runtime/navigationHelpers'

const resourceUrl = 'urls/from/here'

test('DefaultAppContext gets data from browser history with all parts', () => {
    const appContext = new DefaultAppContext(null, resourceUrl)

    expect(appContext.getUrl()).toStrictEqual({
        location: {
            origin: 'http://example.com:8090',
            pathname: '/Page1/abc/123',
            query: {a: '10', b: 'true', c: 'foo'},
            hash: 'things'

        },
        pathPrefix: null
    })
})

test('DefaultAppContext gets data from window location with path prefix and removes trailing slash', () => {

    const appContext = new DefaultAppContext('theApp/somewhere/', resourceUrl)

    expect(appContext.getUrl()).toStrictEqual({
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
    test('adjusts local urls for resource url', () => {
        const appContext = new DefaultAppContext(null, 'https://example.com:8090/theApp/somewhere')

        expect(appContext.getFullUrl('/myImage.jpg')).toBe('https://example.com:8090/theApp/somewhere/myImage.jpg')
        expect(appContext.getFullUrl('special/files/myImage.jpg')).toBe('https://example.com:8090/theApp/somewhere/special/files/myImage.jpg')
    })

    test('adjusts local url for no resource url', () => {
        const appContext: AppContext = new DefaultAppContext(null, undefined)

        expect(appContext.getFullUrl('myImage.jpg')).toBe('/myImage.jpg')
        expect(appContext.getFullUrl('/special/files/myImage.jpg')).toBe('/special/files/myImage.jpg')
    })

    test('does not adjust external urls', () => {
        const appContext: AppContext = new DefaultAppContext(null, 'https://example.com:8090/theApp/somewhere')
        expect(appContext.getFullUrl('https://mysite.com/myImage.jpg')).toBe('https://mysite.com/myImage.jpg')
    })

    test('does not adjust undefined urls', () => {
        const appContext: AppContext = new DefaultAppContext(null, 'https://example.com:8090/theApp/somewhere')
        expect(appContext.getFullUrl(undefined)).toBe(undefined)
    })

})

describe('updateUrl', () => {
    let appContext: AppContext

    beforeEach(() => {
        appContext = new DefaultAppContext(null, resourceUrl)
        appContext.getUrl() //ensure url is cached before update
    })

    test('does push on history with page only', () => {

        appContext.updateUrl('/Page2/xyz', null, null)
        expect(appContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {},
                hash: ''

            },
            pathPrefix: null
        })
    })

    test('does push on history with page query', () => {

        appContext.updateUrl('/Page2/xyz', {a: 10, b: true, c: 'Foo'}, null)
        expect(appContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {a: '10', b: 'true', c: 'Foo'},
                hash: ''

            },
            pathPrefix: null
        })
    })

    test('does push on history with page query and hash', () => {

        appContext.updateUrl('/Page2/xyz', {a: 10, b: true, c: '2012-08-10'}, 'part1')
        expect(appContext.getUrl()).toStrictEqual({
            location: {
                origin: 'http://example.com:8090',
                pathname: '/Page2/xyz',
                query: {a: '10', b: 'true', c: '2012-08-10'},
                hash: 'part1'

            },
            pathPrefix: null
        })
    })

    test('does push on history with path prefix and hash', () => {

        const appContext = new DefaultAppContext('/theApp/somewhere', resourceUrl)

        appContext.updateUrl('/Page2/xyz', null, 'part1')
        expect(appContext.getUrl()).toStrictEqual({
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

test('goBack goes back in browser history', () => {

    const appContext = new DefaultAppContext(null, resourceUrl)
    appContext.getUrl() //ensure url is cached before update

    appContext.updateUrl('/Page2/xyz', null, 'part1')
    expect(appContext.getUrl().location.pathname).toBe('/Page2/xyz')
    goBack()
    expect(appContext.getUrl().location.pathname).toBe('/Page1/abc')
})

describe('can subscribe and be notified of url changes', () => {
    test('from external source', () => {
        const appContext = new DefaultAppContext(null, resourceUrl)
        appContext.getUrl() //ensure url is cached before update

        const callback = jest.fn() as (url: string) => void
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

    test('from updateUrl', () => {
        const appContext = new DefaultAppContext(null, resourceUrl)
        appContext.getUrl() //ensure url is cached before update

        const callback = jest.fn() as (url: string) => void
        onUrlChange( callback )

        appContext.updateUrl('/Page2/xyz', {a: 10, b: true, c: '2012-08-10'}, 'part1')
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

    test('can subscribe and unsubscribe', () => {
        const appContext = new DefaultAppContext(null, resourceUrl)
        appContext.getUrl() //ensure url is cached before update

        const callback1 = jest.fn() as (url: string) => void
        const callback2 = jest.fn() as (url: string) => void
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

