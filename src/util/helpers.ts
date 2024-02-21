import {ElementType, EventActionPropertyDef, PropertyDef, PropertyExpr, PropertyValue} from '../model/Types'
import lodash from 'lodash';
import Element from '../model/Element'
import {parseISO} from 'date-fns'

const {isObject} = lodash;

export function definedPropertiesOf(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(([,val]) => val !== undefined))
}

export const isExpr = (propertyValue: PropertyValue): propertyValue is PropertyExpr => isObject(propertyValue) && 'expr' in propertyValue
export const isEventAction = (propertyDef: PropertyDef): boolean => isObject(propertyDef.type) && (propertyDef.type as EventActionPropertyDef).type === 'Action'

export const isNumeric = (s: string) : boolean => s!== '' && s.match(/^\d*\.?\d*$/) !== null
export const isBooleanString = (s: string) : boolean => s.match(/true|false/) !== null
export const elementToJSON = (value: Element | Element[]) => JSON.stringify(value, null, 2)

export function elementId(elementType: ElementType, idSeq: number) {
    return `${elementType.toLowerCase()}_${idSeq}`
}

export const toArray = (value: any) => Array.isArray(value) ? value : [value]

export const noSpaces = (s: string) => s.replace(/ /g, '')
export const withDots = (...strings: string[]) => strings.join('.')

export const startsWithUppercase = (name: string) => name.match(/^[A-Z]/)
export const isTruthy = (x: any) => !!x
export const notEmpty = (x: any) => x !== undefined && x !== null
export const notBlank = (x: any) => x !== undefined && x !== null && x !== ''
export const noop = () => {}
export const trimParens = (expr?: string) => expr?.startsWith('(') ? expr.replace(/^\(|\)$/g, '') : expr
export const parseParam = (param: string) => {
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

export const waitUntil = async <T>(fn: () => T, intervalTime = 1000, timeout = 5000): Promise<T> => {
    const startTime = new Date().getTime();
    try {
        const result = await fn()
        if (result) {
            return Promise.resolve(result)
        } else {
            return new Promise((resolve, reject) => {
                const timer = setInterval(async () => {
                    try {
                        const result = await fn()
                        if (result) {
                            clearInterval(timer);
                            resolve(result);
                        } else if (new Date().getTime() - startTime > timeout) {
                            clearInterval(timer);
                            reject(new Error('Max wait reached for ' + fn.toString()));
                        }
                    } catch (e) {
                        clearInterval(timer);
                        reject(e);
                    }
                }, intervalTime);
            });
        }
    } catch (e) {
        return Promise.reject(e);
    }
}
export const wait = (time: number = 200): Promise<void> => new Promise(resolve => setTimeout(resolve, time))
export const pathSegments = (path: string) => path.split('/')
export const previewPathComponents = (pathname: string): {appName: string, prefix?: string, pageName?: string, filepath?: string} | null => {
    const [, prefix, appName, remainder] = pathname.match(new RegExp(`^\/studio\/preview\/(tools/)?([^/]+)\/?(.*)$`)) ?? []
    if (!appName) {
        return null
    }
    const appNameAndPrefix = prefix ? {appName, prefix} : {appName}
    if (remainder.match(/^[^./]+$/)) {
        return {...appNameAndPrefix, pageName: remainder}
    }
    if (remainder) {
        return {...appNameAndPrefix, filepath: remainder}
    }
    return appNameAndPrefix
}
