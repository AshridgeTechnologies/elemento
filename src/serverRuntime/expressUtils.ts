import express, {type NextFunction} from 'express'
import {getAuth} from 'firebase-admin/auth'
import {ValidationError} from '../runtime/globalFunctions'
import {AppFactory, requestHandler} from './requestHandler'

export function errorHandler (err: any, req: any, res: any, _next: any) {
    const isValidation = err instanceof ValidationError
    const status = err.status ?? (isValidation ? 400 : 500)
    const {message} = err
    console.error(message, isValidation ? '' : err)
    res?.status(status)
    res?.send({error: {status, message}})
}

export async function getCurrentUser(req: any) {
    const authHeader = req.get('Authorization')
    const idToken = authHeader?.match(/Bearer *(.*)$/)[1]
    return idToken ? await getAuth().verifyIdToken(idToken) : null
}

export function logCall(req: any, res: any, next: NextFunction) {
    console.log(req.method, req.url)
    next()
}

export function expressApp(appFactory: AppFactory) {
    const app = express()
    app.use(express.json())
    app.use('/capi', requestHandler(appFactory))
    app.use(errorHandler)

    return app
}
