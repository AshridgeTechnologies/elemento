import {AppFactoryMap, handleServerRequest} from './requestHandler'

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

    if (pathname.startsWith('/capi/')) {
        return handleServerRequest(request, serverApps)
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
