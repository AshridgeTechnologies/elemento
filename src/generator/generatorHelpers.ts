import Topo from '@hapi/topo'
import {isArray, isPlainObject} from 'lodash'

function safeKey(name: string) {
    return name.match(/\W/) ? `'${name}'` : name
}

export const quote = (s: string) => `'${s}'`

export function objectLiteralEntries(obj: object, suffixIfNotEmpty: string = '') {
    const entries = Object.entries(obj)
    return entries.length ? entries.map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ') + suffixIfNotEmpty : ''
}

export function objectLiteral(obj: object) {
    return `{${objectLiteralEntries(obj)}}`
}

export type StateEntry = [name: string, code: string | DefinedFunction, dependencies: string[]]

export class DefinedFunction {
    constructor(public functionDef: string) {
    }
}

export const topoSort = (entries: StateEntry[]): StateEntry[] => {
    const sorter = new Topo.Sorter<StateEntry>()
    entries.forEach(entry => {
        const [name, , dependencies] = entry
        sorter.add([entry], {after: dependencies, group: name})  // if add plain tuple, sorter treats it as an array
    })
    return sorter.nodes
}
export const valueLiteral = function (propertyValue: any): string {
    if (isPlainObject(propertyValue)) {
        return `{${Object.entries(propertyValue).map(([name, val]) => `${name}: ${valueLiteral(val)}`).join(', ')}}`
    } else if (isArray(propertyValue)) {
        return `[${propertyValue.map(valueLiteral).join(', ')}]`
    } else if (typeof propertyValue === 'string') {
        return propertyValue.includes('\n') ? `\`${propertyValue}\`` : `'${propertyValue.replace(/'/g, "\\'")}'`
    } else {
        return String(propertyValue)
    }
}