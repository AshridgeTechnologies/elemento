import {isObject, isString, mapValues} from 'radash'
import {parseISO} from 'date-fns'
import {parseParam} from '../util/helpers'

export type ServerAppHandler = {
    [key: string]: { func: (...args: Array<any>) => any, update: boolean, argNames: string[] }
}
export type AppFactory = (appName: string, user: any | null) => Promise<ServerAppHandler>

export type AppFactoryMap = {[name: string]: AppFactory}

const convertDataValues = (val: any): any => {
    if (isString(val)) {
        const date = parseISO(val)
        if (!Number.isNaN(date.getTime())) {
            return date
        }
    }

    if (isObject(val)) {
        return mapValues(val, convertDataValues)
    }

    return val
}

function responseError(status: number, error: string) {
    return new Response(error, {status})
}

export function parseQueryParams(req: Request): object {
    const url = new URL(req.url);
    const entries = Array.from(url.searchParams.entries())
    const parsedEntries = entries.map( ([key, value]) => [key, parseParam(value)])
    return Object.fromEntries(parsedEntries)
}

export const requestHandler = (appFactory: AppFactory) => async (req: Request) => {
    try {
        const currentUser = null //await getCurrentUser(req)
        // console.log('user id', currentUser?.uid)
        const url = new URL(req.url);
        const pathname = url.pathname
        const match = pathname.match(/^\/capi\/(\w+)\/(\w+)$/)
        if (!match) {
            return responseError(404, 'Not Found: ' + pathname)
        }
        const [, appName, functionName] = match
        const handlerApp = await appFactory(appName, currentUser)

        const {func, update, argNames} = handlerApp[functionName] ?? {}
        if (!func) {
            return responseError(404, 'Not Found: ' + functionName)
        }

        if (update && req.method !== 'POST') {
            return responseError(405, 'Method Not Allowed')
        }
        const params = req.method === 'GET' ? parseQueryParams(req) : convertDataValues(req.body)
        const argValues = argNames.map((n) => params[n])
        const result = await func(...argValues)
        const options = { headers: { "content-type": 'application/json' } };
        return new Response(result, options)
    } catch (err) {
        console.error(err)
        return responseError(500, 'Server error\n' + err)
    }
}

export const handleServerRequest = async (req: Request, apps: AppFactoryMap) => {
    const url = new URL(req.url);
    const pathname = url.pathname
    const match = pathname.match(/^\/capi\/(\w+)\/(\w+)$/)
    if (!match) {
        return new Response('Not Found: ' + pathname, {status: 404})
    }

    const [, app] = match
    const appFactory = apps[app]
    console.log('appFactory', appFactory)
    const handler = requestHandler(appFactory)
    return handler(req)
}

