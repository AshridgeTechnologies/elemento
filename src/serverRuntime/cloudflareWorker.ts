import {AppFactoryMap, handleServerRequest} from './requestHandler'
import getIssuer from './issuer'

const defaultElementoHost = 'https://elemento.online'
const localElementoHost = 'http://localhost:8000'

const isPassThrough = (pathname: string) => {
    return pathname.startsWith('/lib/')
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
