import {CombinedPropertyValue, ElementType, EventActionPropertyDef, PropertyDef, PropertyExpr, PropertyValue} from '../model/Types'
import lodash from 'lodash'
import Element from '../model/Element'
import {parseISO} from 'date-fns'
import {pickBy} from 'ramda'

const {isObject} = lodash

export function definedPropertiesOf(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(([,val]) => val !== undefined))
}

export const isExpr = (propertyValue: CombinedPropertyValue): propertyValue is PropertyExpr => isObject(propertyValue) && 'expr' in propertyValue
export const isEventAction = (propertyDef: PropertyDef): boolean => isObject(propertyDef.type) && (propertyDef.type as EventActionPropertyDef).type === 'Action'

export const isNumeric = (s: string | undefined) : boolean => s !== undefined && s!== '' && s.match(/^\d*\.?\d*$/) !== null
export const isNumericAnySign = (s: string) : boolean => s!== '' && s.match(/^-?\d*\.?\d*$/) !== null
export const isBooleanString = (s: string) : boolean => s.match(/true|false/) !== null
export const elementToJSON = (value: Element | Element[]) => JSON.stringify(value, null, 2)

export function elementId(elementType: ElementType, idSeq: number) {
    return `${elementType.toLowerCase()}_${idSeq}`
}

export const toArray = (value: any) => Array.isArray(value) ? value : [value]
export const unique = (array: any[]) => [...new Set(array)]

export const noSpaces = (s: string) => s.replace(/ /g, '')
export const withDots = (...strings: string[]) => strings.join('.')

export const startsWithUppercase = (name: string) => name.match(/^[A-Z]/)
export const isTruthy = (x: any) => !!x
export const notEmpty = (x: any) => x !== undefined && x !== null
export const notBlank = (x: any) => x !== undefined && x !== null && x !== ''
export const noop = () => {}
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
    const startTime = new Date().getTime()
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
                            clearInterval(timer)
                            resolve(result)
                        } else if (new Date().getTime() - startTime > timeout) {
                            clearInterval(timer)
                            reject(new Error('Max wait reached for ' + fn.toString()))
                        }
                    } catch (e) {
                        clearInterval(timer)
                        reject(e)
                    }
                }, intervalTime)
            })
        }
    } catch (e) {
        return Promise.reject(e)
    }
}
export const wait = (time: number = 200): Promise<void> => new Promise(resolve => setTimeout(resolve, time))
export const pathSegments = (path: string) => path.split('/')
export const previewPathComponents = (pathname: string): {projectId: string, appName: string, prefix?: string, pageName?: string, filepath?: string} | null => {
    const [, projectId, prefix, appName, remainder] = pathname.match(new RegExp(`^\/studio\/preview\/([^/]+)\/(tools/)?([^/]+)\/?(.*)$`)) ?? []
    if (!appName || !projectId) {
        return null
    }
    const baseComponents = {projectId, appName, ...definedPropertiesOf({prefix})}
    if (remainder.match(/^[^./]+$/)) {
        return {...baseComponents, pageName: remainder}
    }
    if (remainder) {
        return {...baseComponents, filepath: remainder}
    }
    return baseComponents
}

const isoDateRegex = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/
export const isoDateReviver = (key: string, value: any) => {
    if (typeof value === 'string' && value.match(isoDateRegex)) {
        const date = parseISO(value)
        if (!Number.isNaN(date.getTime())) {
            return date
        }
    }

    return value
}

export const withoutUndefined = (obj: object) => {
    return pickBy( val => val !== undefined, obj)
}

export const wordAtPosition = (text: string, position: number) => {
    const previousWordPosition = text.slice(0, position + 1).search(/\w+\W*$/)
    if (previousWordPosition < 0) return ''
    const previousWord = text.slice(previousWordPosition).match(/\w+/)?.[0]
    if (!previousWord || position > previousWordPosition + previousWord.length) return ''
    return previousWord
}
