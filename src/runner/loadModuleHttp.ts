import * as Module from 'module'

export function loadModuleHttp(url: string): Promise<Module> {
    return import(url)
}