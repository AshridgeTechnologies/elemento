import {getApp} from '../../src/serverRuntime/firebaseApp'
import {DecodedIdToken, getAuth} from 'firebase-admin/auth'
import {mockImplementation} from '../testutil/testHelpers'
import {
    AppFactory,
    errorHandler,
    getCurrentUser,
    parseQueryParams,
    requestHandler,
    ServerAppHandler
} from '../../src/serverRuntime/expressUtils'
import {expressApp} from '../../src/serverRuntime'

jest.mock('firebase-admin/auth')
jest.mock('../../src/serverRuntime/firebaseApp')

function mockAuth(user = {uid: 'fred'}) {
    const mockApp = {}
    const verifyIdToken = jest.fn().mockResolvedValue(user)
    mockImplementation(getApp, () => mockApp)
    mockImplementation(getAuth, () => ({verifyIdToken}))
    return verifyIdToken
}

test('parses query params to most likely type', () => {
    const params = {
        foo: 'Dentist',
        bar: '27',
        trix: 'false',
        trax: 'true',
        startDate: '2022-07-21',
        startTime: '2022-11-03T08:30:48.353Z'
    }

    const parsedParams = parseQueryParams({query: params})
    expect(parsedParams).toStrictEqual({
        foo: 'Dentist',
        bar: 27,
        trix: false,
        trax: true,
        startDate: new Date(2022, 6, 21),
        startTime: new Date(2022, 10, 3, 8, 30, 48, 353)
    })
})

test('gets user from id token in authorization header', async () => {
    const req: any = {
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const theUser = {uid: 'fred'}
    const verifyIdTokenFn = mockAuth(theUser)

    const user = await getCurrentUser(req)

    expect(user).toBe(theUser)
    expect(verifyIdTokenFn).toHaveBeenCalledWith('the_token')
})

test('no user if no authorization header', async () => {
    jest.fn()
    const req: any = {
        get: (name: string) => null
    }

    const user = await getCurrentUser(req)
    expect(user).toBeNull()
})

const testAppFactory = (app: ServerAppHandler): AppFactory => async (appName: string, user: DecodedIdToken | null) => app
const mockRes = ()=> {
    const res: any = {
        json: jest.fn(),
            status: jest.fn(() => res),
        send: jest.fn()
    }
    return res
}

const callRequestHandler = async (serverApp: ServerAppHandler, req: any) => {
    const appFactory = testAppFactory(serverApp)
    const res = mockRes()
    mockAuth()

    const next = jest.fn()
    const handlerFn = requestHandler(appFactory)
    await handlerFn(req, res, next)
    return [res, next]
}

test('requestHandler handles get request', async () => {
    const getItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const serverApp = { GetIt: {func: getItFn, update: false, argNames: ['x', 'y']} }
    const req: any = {
        method: 'GET',
        path: '/serverApp/GetIt',
        query: {x: '10', y: '20'},
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const [res, next] = await callRequestHandler(serverApp, req)

    expect(getItFn).toHaveBeenCalledWith(10, 20)
    expect(res.json).toHaveBeenCalledWith({x: 10, y: 20})
    expect(next).not.toHaveBeenCalled()
})

test('requestHandler handles post request', async () => {
    const doItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const serverApp = { DoIt: {func: doItFn, update: true, argNames: ['x', 'y']} }
    const req: any = {
        method: 'POST',
        path: '/serverApp/DoIt',
        body: {x: 10, y: 20},
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const [res, next] = await callRequestHandler(serverApp, req)

    expect(doItFn).toHaveBeenCalledWith(10, 20)
    expect(res.json).toHaveBeenCalledWith({x: 10, y: 20})
    expect(next).not.toHaveBeenCalled()
})

test('requestHandler passes on error in the server app function', async () => {
    const doItFn = jest.fn().mockImplementation(() => {
        throw new Error('Bad data')
    })
    const serverApp = { DoIt: {func: doItFn, update: true, argNames: ['x', 'y']} }
    const req: any = {
        method: 'POST',
        path: '/serverApp/DoIt',
        body: {x: 10, y: 20},
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const [res, next] = await callRequestHandler(serverApp, req)

    expect(doItFn).toHaveBeenCalledWith(10, 20)
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new Error('Bad data'))
})

test('requestHandler passes on error if method incorrect', async () => {
    const doItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const serverApp = { DoIt: {func: doItFn, update: true, argNames: ['x', 'y']} }
    const req: any = {
        method: 'GET',
        path: '/serverApp/DoIt',
        query: {x: '10', y: '20'},
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const [res, next] = await callRequestHandler(serverApp, req)

    expect(doItFn).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new Error('Method Not Allowed'))
})

test('requestHandler passes on error if function not found', async () => {
    const getItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const serverApp = { GetIt: {func: getItFn, update: false, argNames: ['x', 'y']} }
    const req: any = {
        method: 'GET',
        path: '/serverApp/WhatIsThis',
        query: {x: '10', y: '20'},
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const [res, next] = await callRequestHandler(serverApp, req)

    expect(getItFn).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new Error('Not Found'))
})

test('requestHandler passes on error if malformed URL', async () => {
    const getItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const serverApp = { GetIt: {func: getItFn, update: false, argNames: ['x', 'y']} }
    const req: any = {
        method: 'GET',
        path: '/serverApp/Stuff.txt',
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const [res, next] = await callRequestHandler(serverApp, req)

    expect(getItFn).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new Error('Not Found'))
})

test('error handler sends message from HTTP error as JSON', () => {
    const res: any = {
            status: jest.fn(() => res),
            send: jest.fn()
    }

    const err = new Error('Method Not Allowed')
    // @ts-ignore
    err.status = 405

    errorHandler(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.send).toHaveBeenCalledWith({error: {status: 405, message: 'Method Not Allowed' }})
})

test('error handler sends message from app error as JSON', () => {
    const res: any = {
            status: jest.fn(() => res),
            send: jest.fn()
    }

    const err = new Error('Bad stuff happened')

    errorHandler(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({error: {status: 500, message: 'Bad stuff happened' }})
})

test('express app handles get request', async () => {
    let server
    try {
        const getItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
        const appFactory: AppFactory = async (appName: string, user: DecodedIdToken | null) => {
            return { GetIt: {func: getItFn, update: false, argNames: ['x', 'y']} }
        }

        const app = expressApp(appFactory)
        server = await new Promise<any>(resolve => {
            const server = app.listen(3333, () => resolve(server))
        })
        const result = await fetch('http://localhost:3333/capi/serverApp/GetIt?x=10&y=20').then(resp => resp.json())
        expect(getItFn).toHaveBeenCalledWith(10, 20)
        expect(result).toMatchObject({x: 10, y: 20})
    } finally {
        server.close()
    }
})

