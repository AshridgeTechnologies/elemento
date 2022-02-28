import {isArray, isPlainObject} from 'lodash'

export function codeGenerationError(expr: string, err: string) {
    console.log('Error in expression:', expr, ':', err)
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

export const appCode = () => {
    // @ts-ignore
    const code = frames[0].document.querySelector('script#appMainCode').innerHTML
    console.log(code)
    return code
}