import {isObject, isString, mapValues} from 'radash'
import {parseISO} from 'date-fns'
import {parseParam} from '../util/helpers'

export type ServerAppHandler = {
    [key: string]: { func: (...args: Array<any>) => any, update: boolean, argNames: string[] }
}
export type AppFactory = (user: any | null, env: any, ctx: any) => Promise<ServerAppHandler>

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

function parseQueryParams(req: Request): object {
    const url = new URL(req.url);
    const entries = Array.from(url.searchParams.entries())
    const parsedEntries = entries.map( ([key, value]) => [key, parseParam(value)])
    return Object.fromEntries(parsedEntries)
}

export const handleServerRequest = async (req: Request, env: any, ctx: any, apps: AppFactoryMap) => {
    const pathname = new URL(req.url).pathname
    const match = pathname.match(/^\/capi\/(\w+)\/(\w+)$/)
    if (!match) {
        return new Response('Not Found: ' + pathname, {status: 404})
    }

    const [, appName, functionName] = match
    const appFactory = apps[appName]
    console.log('appFactory', appFactory)
    try {
        const currentUser = null //await getCurrentUser(req)
        // console.log('user id', currentUser?.uid)
        const handlerApp = await appFactory(currentUser, env, ctx)

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
        const options = {headers: {"content-type": 'application/json'}};
        return new Response(JSON.stringify(result), options)
    } catch (err) {
        console.error(err)
        return responseError(500, 'Server error\n' + err)
    }
}

