import {PropertyExpr, PropertyValue} from '../model/Types'
import {isObject} from 'lodash'

export function definedPropertiesOf(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(([,val]) => val !== undefined))
}

export const isExpr = function (propertyValue: PropertyValue): propertyValue is PropertyExpr {
    return isObject(propertyValue) && 'expr' in propertyValue
}

export const isNumeric = (s: string) : boolean => s!== '' && s.match(/^\d*\.?\d*$/) !== null