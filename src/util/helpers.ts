import {PropertyExpr, PropertyValue} from '../model/Types'
import {isObject} from 'lodash'

export function definedPropertiesOf(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(([,val]) => val !== undefined))
}

export function ex([s]: TemplateStringsArray) {
    return {expr: s}
}

export const isExpr = function (propertyValue: PropertyValue): propertyValue is PropertyExpr {
    return isObject(propertyValue) && 'expr' in propertyValue
}