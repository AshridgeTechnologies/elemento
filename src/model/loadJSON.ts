import Element from './Element'
import {ElementId, ElementType} from './Types'
import {isoDateReviver} from '../util/helpers'
import {createElement} from './createElement'

type ElementJson = { id: ElementId, kind: ElementType, name: string, properties: any, elements?: any[] }

function loadJSONElement({id, kind, name, properties, elements}: ElementJson): Element {
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
