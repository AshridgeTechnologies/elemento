import Element from './Element'
import {ElementId, ElementType} from './Types'
import * as theElements from '../model/elements'


type ElementJson = { id: ElementId, kind: ElementType, name: string, properties: any, elements?: any[] }

function loadJSONElement({id, kind, name, properties, elements}: ElementJson): Element {

    const loadElements = () => elements?.map(el => loadJSONElement(el))
    const elementClass = theElements[kind]
    return new elementClass(id, name, properties, loadElements())
}

export function loadJSON(json: ElementJson | ElementJson[]): Element | Element[] {
    if (Array.isArray(json)) {
        return json.map(loadJSONElement)
    }

    return loadJSONElement(json)
}

export function loadJSONFromString(json: string): Element | Element[] {
    return loadJSON(JSON.parse(json))
}
