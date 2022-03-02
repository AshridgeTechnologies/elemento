import {isArray, isObject, isPlainObject} from 'lodash'
import {map} from 'ramda'

export function codeGenerationError(_expr: string, _err: string) {
    //console.log('Error in expression:', _expr, ':', _err)
    return undefined
}

// copy of function used in Generator to avoid additional dependencies for runtime code
export const valueLiteral = function (propertyValue: any): string {
    if (isPlainObject(propertyValue)) {
        return `{${Object.entries(propertyValue).map(([name, val]) => `${name}: ${valueLiteral(val)}`).join(', ')}}`
    } else if (isArray(propertyValue)) {
        return `[${propertyValue.map(valueLiteral).join(', ')}]`
    } else if (typeof propertyValue === 'string') {
        return propertyValue.includes('\n') ? `\`${propertyValue}\`` : `'${propertyValue}'`
    } else {
        return String(propertyValue)
    }
}

export const showAppCode = () => {
    // @ts-ignore
    const code = document.querySelector('script#appMainCode').innerHTML
    console.log(code)
    return code
}

export type Value<T> = T | { valueOf: () => T }
export function valueOf<T>(x: Value<T>): T {
    return isObject(x) ? x.valueOf() : x
}

export const valueOfProps = (props: object): any => map(valueOf, props)
