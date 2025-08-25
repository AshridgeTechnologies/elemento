import Element from './Element'
import {ElementId, ElementType} from './Types'
import {isoDateReviver} from '../util/helpers'
import {createElement, validateElement} from './createElement'

export type ElementJson = { id: ElementId, kind: ElementType, name: string, properties: any, elements?: any[] }

function loadJSONElement(elementJson: ElementJson): Element {
    const {id, kind, name, properties, elements} = elementJson
    const errors = validateElement(elementJson)
    if (errors) {
        // console.error('Elemento JSON validation error', errors)
        throw new Error('Elemento JSON validation error', {cause: errors})
    }
    const childElements = elements?.map(el => loadJSONElement(el))
    return createElement(kind, id, name, properties, childElements)
}

export function loadJSON(json: ElementJson | ElementJson[]): Element | Element[] {
    if (Array.isArray(json)) {
        return json.map(loadJSONElement)
    }

    return loadJSONElement(json)
}

export function loadJSONFromString(json: string): Element | Element[] {
    return loadJSON(JSON.parse(json, isoDateReviver))
}
