import {ElementType, PropertyExpr, PropertyValue} from '../model/Types'
import {isObject} from 'lodash'
import Element from '../model/Element'

export function definedPropertiesOf(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(([,val]) => val !== undefined))
}

export const isExpr = function (propertyValue: PropertyValue): propertyValue is PropertyExpr {
    return isObject(propertyValue) && 'expr' in propertyValue
}

export const isNumeric = (s: string) : boolean => s!== '' && s.match(/^\d*\.?\d*$/) !== null
export const isBooleanString = (s: string) : boolean => s.match(/true|false/) !== null
export const elementToJSON = (value: Element | Element[]) => JSON.stringify(value, null, 2)

export function elementId(elementType: ElementType, idSeq: number) {
    return `${elementType.toLowerCase()}_${idSeq}`
}

export const toArray = (value: any) => Array.isArray(value) ? value : [value]

export const noSpaces = (s: string) => s.replace(/ /g, '')

export const isTruthy = (x: any) => !!x
export const trimParens = (expr?: string) => expr?.startsWith('(') ? expr.replace(/^\(|\)$/g, '') : expr