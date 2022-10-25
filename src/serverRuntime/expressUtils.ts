import {getAuth} from 'firebase-admin/auth'
import {map} from 'ramda'
import {isBooleanString, isNumeric} from '../util/helpers'
import {parseISO} from 'date-fns'
import {getApp} from './firebaseApp'

type AppFactory = (user: object) => any

const parseParam = (param: string) => {
    if (isNumeric(param)) {
        return parseFloat(param)
    }

    if (isBooleanString(param)) {
        return param === true.toString()
    }

    const date = parseISO(param)
    if (!Number.isNaN(date.getTime())) {
        return date
    }

    return param
}

export function parseQueryParams(req: {query: { [key: string]: string; }}): object {
    return map(parseParam, req.query as any) as object
}

export function checkUser(req: any, res: any, next: () => void) {
    const authHeader = req.get('Authorization')
    const idToken = authHeader?.match(/Bearer *(.*)$/)[1]

    if (idToken) {
        getAuth(getApp()).verifyIdToken(idToken)
            .then((userDetails) => {
                console.log('user id', userDetails.uid)
                req.currentUser = userDetails
                next()
            })
            .catch((error) => {
                throw error
            })
    } else {
        next()
    }

}

export function handlerApp(appFactory: AppFactory) {
    return (req: any, res: any, next: (err?: any) => void) => {
        req.handlerApp = appFactory(req.currentUser)
        next()
    }
}


export function requestHandler(...argNames: string[]) {
    return async (req: any, res: any, next: (err?: any) => void) => {
        const functionName = req.path.match(/\/(\w+)$/)[1]
        const params = req.method === 'GET' ? parseQueryParams(req) : req.body
        const argValues = argNames.map(n => params[n])
        try {
            const result = await req.handlerApp[functionName](...argValues)
            res.json(result)
        } catch (err) {
            next(err)
        }
    }
}

export function errorHandler (err: any, req: any, res: any, next: (err?: any) => void) {
    res.status(500).send({ error: {message: err.message} })
}
