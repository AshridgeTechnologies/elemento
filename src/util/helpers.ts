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
export const elementToJSON = (value: Element | Element[]) => JSON.stringify(value, null, 2)

export function elementId(elementType: ElementType, idSeq: number) {
    return `${elementType.toLowerCase()}_${idSeq}`
}

export const toArray = (value: any) => Array.isArray(value) ? value : [value]

export function noSpaces(s: string) {
    return s.replace(/ /g, '')
}