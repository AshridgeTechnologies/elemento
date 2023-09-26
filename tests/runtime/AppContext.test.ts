import AppContext, {DefaultAppContext, UrlType} from '../../src/runtime/AppContext'
import {BrowserHistory, createMemoryHistory} from 'history'

let browserHistory: BrowserHistory

beforeEach(() => {
    browserHistory = createMemoryHistory()
})

test('DefaultAppContext gets data from browser history with all parts', () => {
    const history = createMemoryHistory({
        initialEntries: ['/Page1/abc/123?a=10&b=true&c=foo#things'],
    })
    const appContext = new DefaultAppContext(null, history, 'http://example.com:8090')

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

test('DefaultAppContext caches url', () => {
    const history = createMemoryHistory({initialEntries: ['/Page1/abc'],})
    const appContext = new DefaultAppContext(null, history, 'http://example.com:8090')

    expect(appContext.getUrl()).toBe(appContext.getUrl())
})

test('DefaultAppContext gets data from window location with path prefix and removes trailing slash', () => {

    const history = createMemoryHistory({initialEntries: ['/theApp/somewhere/Page1/abc/123']})
    const appContext = new DefaultAppContext('theApp/somewhere/', history, 'http://example.com:8090')

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

describe('updateUrl', () => {
    let history: BrowserHistory, appContext: AppContext

    beforeEach(() => {
        history = createMemoryHistory({initialEntries: ['/Page1/abc'],})
        appContext = new DefaultAppContext(null, history, 'http://example.com:8090')
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

        const appContext = new DefaultAppContext('/theApp/somewhere', history, 'http://example.com:8090')

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

    const history = createMemoryHistory({initialEntries: ['/Page1/abc'],})
    const appContext = new DefaultAppContext(null, history, 'http://example.com:8090')
    appContext.getUrl() //ensure url is cached before update

    appContext.updateUrl('/Page2/xyz', null, 'part1')
    expect(appContext.getUrl().location.pathname).toBe('/Page2/xyz')
    appContext.goBack()
    expect(appContext.getUrl().location.pathname).toBe('/Page1/abc')
})

describe('can subscribe and be notified of url changes', () => {
    test('from external source', () => {
        const history = createMemoryHistory({initialEntries: ['/Page1/abc'],})
        const appContext = new DefaultAppContext(null, history, 'http://example.com:8090')
        appContext.getUrl() //ensure url is cached before update

        const callback = jest.fn() as (url: UrlType) => void
        const subscription = appContext.onUrlChange( callback )

        history.push('/Page2/xyz?a=10&b=true&c=2012-08-10#part1')
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
        const history = createMemoryHistory({initialEntries: ['/Page1/abc'],})
        const appContext = new DefaultAppContext(null, history, 'http://example.com:8090')
        appContext.getUrl() //ensure url is cached before update

        const callback = jest.fn() as (url: UrlType) => void
        const subscription = appContext.onUrlChange( callback )

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
        const history = createMemoryHistory({initialEntries: ['/Page1/abc'],})
        const appContext = new DefaultAppContext(null, history, 'http://example.com:8090')
        appContext.getUrl() //ensure url is cached before update

        const callback1 = jest.fn() as (url: UrlType) => void
        const callback2 = jest.fn() as (url: UrlType) => void
        const unsubscribe1 = appContext.onUrlChange( callback1 )
        const unsubscribe2 = appContext.onUrlChange( callback2 )

        history.push('/Page2/xyz?a=10&b=true&c=2012-08-10#part1')
        expect(callback1).toHaveBeenCalled()
        expect(callback2).toHaveBeenCalled()

        unsubscribe1()
        history.push('/Page2/xyz?a=10&b=true&c=2012-08-10#part1')
        expect(callback1).toHaveBeenCalledTimes(1)
        expect(callback2).toHaveBeenCalledTimes(2)
    })
})

