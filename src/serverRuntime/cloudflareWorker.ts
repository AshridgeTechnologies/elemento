import {getWsServerDurableObjectFetch,} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import {AppFactoryMap, handleServerRequest} from './requestHandler'
import getIssuer from './issuer'

const defaultElementoHost = 'https://elemento.online'
const localElementoHost = 'http://localhost:8000'

const isPassThrough = (pathname: string) => {
    return pathname.startsWith('/lib/')
}

const durableObjectFetch = getWsServerDurableObjectFetch('TinyBaseDurableObjects')

export const handleDurableObjectRequest = async (request: Request, env: any): Promise<Response> => {
    const protocolHeader = request.headers.get('sec-websocket-protocol') ?? ''
    const [authToken, dummyProtocol] = protocolHeader.split(/ *, */)
    if (authToken !== 'auth-token-1') {
        return new Response('Unauthorized', {status: 401})
    }
    const doServerUrl = request.url.replace(/\/do/, '')
    const doServerRequest = new Request(doServerUrl, request)

    const response = await durableObjectFetch(doServerRequest, env)
    const finalResponse = new Response(response.body, response)
    finalResponse.headers.append('sec-websocket-protocol', dummyProtocol)
    return finalResponse
}

export const cloudflareFetch = async (request: Request, env: any, ctx: any, serverApps: AppFactoryMap) => {
    const url = new URL(request.url);
    const pathname = url.pathname
    console.log('In fetch', 'pathname', pathname)
    if (isPassThrough(pathname)) {
        const elementoRuntimeHost = (url.host.match(/^(localhost:)/)) ? localElementoHost : defaultElementoHost
        return Response.redirect(`${elementoRuntimeHost}${pathname}`, 307)
    }

    const pathnameFirstPart = pathname.slice(1).split(/\//)[0]
    if (pathnameFirstPart.startsWith('_auth') || pathnameFirstPart === '.well-known') {
        console.log('Delegating to issuer', 'auth kv namespace', env.auth)
        return getIssuer(env).fetch(request)
    }

    if (url.pathname.startsWith('/do/')) {
        return handleDurableObjectRequest(request, env)
    }

    if (pathname.startsWith('/capi/')) {
        return handleServerRequest(request, env, ctx, serverApps)
    }

    const apps = (env.APPS ?? '').split(/ *, */)
    const appName = pathname.split(/\//)[1]
    if (appName === '') {
        return Response.redirect(`/${apps[0]}/`, 307)
    }
    if (apps.includes(appName)) {
        return env.ASSETS.fetch(`${url.origin}/${appName}/`)
    }

    return new Response('Page not found', {status: 404})
}
