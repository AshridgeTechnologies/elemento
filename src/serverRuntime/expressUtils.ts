import express, {Express} from 'express'
import {getAuth, DecodedIdToken} from 'firebase-admin/auth'
import {map} from 'ramda'
import {parseParam} from '../util/helpers'
import {getApp} from './firebaseApp'

export type ServerAppHandler = {
    [key: string]: {func: (...args: Array<any>) => any, update: boolean, argNames: string[]}
}
export type AppFactory = (appName: string, user: DecodedIdToken | null) => Promise<ServerAppHandler>

export function parseQueryParams(req: {query: { [key: string]: string; }}): object {
    return map(parseParam, req.query as any) as object
}
export function errorHandler (err: any, req: any, res: any, next: (err?: any) => void) {
    const {status = 500, message} = err
    res.status(status).send({ error: {status, message} })
}

function responseError(status: number, error: string) {
    const err = new Error(error)
    // @ts-ignore
    err.status = status
    return err
}

export async function getCurrentUser(req: any) {
    const authHeader = req.get('Authorization')
    const idToken = authHeader?.match(/Bearer *(.*)$/)[1]
    return idToken ? await getAuth(getApp()).verifyIdToken(idToken) : null
}

export const requestHandler = (appFactory: AppFactory) => async (req: any, res: any, next: (err?: any) => void) => {
    try {
        const currentUser = await getCurrentUser(req)
        console.log('user id', currentUser?.uid)
        const match = req.path.match(/\/(\w+)\/(\w+)$/)
        if (!match) {
            next(responseError(404, 'Not Found'))
            return
        }
        const [appName, functionName] = match.slice(1)
        const handlerApp = await appFactory(appName, currentUser)

        const {func, update, argNames} = handlerApp[functionName] ?? {}
        if (!func) {
            next(responseError(404, 'Not Found'))
            return
        }

        if (update && req.method !== 'POST') {
            next(responseError(405, 'Method Not Allowed'))
            return
        }
        const params = req.method === 'GET' ? parseQueryParams(req) : req.body
        const argValues = argNames.map((n: string) => params[n])
        const result = await func(...argValues)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export function setupExpressApp(app: Express, appFactory: AppFactory) {
    app.use(express.json())
    app.use('/capi', requestHandler(appFactory))
    app.use(errorHandler)
}

export function expressApp(appFactory: AppFactory) {
    const app = express()
    setupExpressApp(app, appFactory)

    return app
}