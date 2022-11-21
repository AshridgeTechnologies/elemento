import {expressUtils} from '../../src/serverRuntime'
import {getApp} from '../../src/serverRuntime/firebaseApp'
import {getAuth} from 'firebase-admin/auth'
import {mockImplementation} from '../testutil/testHelpers'
import {errorHandler} from '../../src/serverRuntime/expressUtils'

jest.mock('firebase-admin/auth')
jest.mock('../../src/serverRuntime/firebaseApp')

const {parseQueryParams, checkUser, handlerApp, requestHandler} = expressUtils

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
    const next = jest.fn()
    const req: any = {
        get: (name: string) => name === 'Authorization' && 'Bearer the_token'
    }
    const theUser = {uid: 'fred'}

    const mockApp = {}
    const verifyIdToken = jest.fn().mockResolvedValue(theUser)
    mockImplementation(getApp, () => mockApp)
    mockImplementation(getAuth, () => ({verifyIdToken}))

    const originalLogFn = console.log
    const mockLog = console.log = jest.fn()
    try {
        await checkUser(req, {}, next)
    } finally {
        console.log = originalLogFn
    }

    expect(req.currentUser).toBe(theUser)
    expect(verifyIdToken).toHaveBeenCalledWith('the_token')
    expect(next).toHaveBeenCalled()
    expect(mockLog).toHaveBeenCalledWith('user id', 'fred')
})

test('no user if no authorization header', async () => {
    const next = jest.fn()
    const req: any = {
        get: (name: string) => null
    }

    await checkUser(req, {}, next)

    expect(req.currentUser).toBeUndefined()
    expect(next).toHaveBeenCalled()
})

test('handlerApp adds app for user to the request', () => {
    const appFactory = (user: object) => ({app: 'App1', user})
    const next = jest.fn()
    const req: any = {currentUser: 'fred'}
    const useFn = handlerApp(appFactory)
    useFn(req, {}, next)
    expect(req.handlerApp).toStrictEqual({app: 'App1', user: 'fred'})
    expect(next).toHaveBeenCalled()
})

test('requestHandler handles get request', async () => {
    const next = jest.fn()
    const getItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const req: any = {
        method: 'GET',
        path: '/serverApp/GetIt',
        query: {x: '10', y: '20'},
        currentUser: 'fred',
        handlerApp: {GetIt: getItFn}
    }
    const res = {json: jest.fn()}

    const handlerFn = requestHandler('x', 'y')
    await handlerFn(req, res, next)

    expect(getItFn).toHaveBeenCalledWith(10, 20)
    expect(res.json).toHaveBeenCalledWith({x: 10, y: 20})
    expect(next).not.toHaveBeenCalled()
})

test('requestHandler handles post request', async () => {
    const next = jest.fn()
    const doItFn = jest.fn().mockImplementation((x: any, y: any) => ({x, y}))
    const req: any = {
        method: 'POST',
        path: '/serverApp/DoIt',
        body: {x: 10, y: 20},
        currentUser: 'fred',
        handlerApp: {DoIt: doItFn}
    }
    const res = {json: jest.fn()}

    const handlerFn = requestHandler('x', 'y')
    await handlerFn(req, res, next)

    expect(doItFn).toHaveBeenCalledWith(10, 20)
    expect(res.json).toHaveBeenCalledWith({x: 10, y: 20})
    expect(next).not.toHaveBeenCalled()
})

test('requestHandler passes on error', async () => {
    const next = jest.fn()
    const doItFn = jest.fn().mockImplementation(() => {
        throw new Error('Bad data')
    })
    const req: any = {
        method: 'POST',
        path: '/serverApp/DoIt',
        body: {x: 10, y: 20},
        handlerApp: {DoIt: doItFn}
    }
    const res = {json: jest.fn()}

    const handlerFn = requestHandler('x', 'y')
    await handlerFn(req, res, next)

    expect(doItFn).toHaveBeenCalledWith(10, 20)
    expect(res.json).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(new Error('Bad data'))
})

test('error handler sends message from error as JSON', () => {
    const res: any = {
            status: jest.fn(() => res),
            send: jest.fn()
    }

    const err = new Error('Bad stuff happened')

    errorHandler(err, {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({error: {message: 'Bad stuff happened' }})
})