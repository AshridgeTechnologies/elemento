import Element from './Element'
import Text from './Text'
import Page from './Page'
import App from './App'
import TextInput from './TextInput'
import {ElementId, ElementType} from './Types'

export function loadJSON({id, kind, name, properties, elements}:
                             { id: ElementId, kind: ElementType, name: string, properties: any, elements?: any[] }): Element {

    const loadElements = () => (elements || []).map(el => loadJSON(el))

    switch(kind) {
        case "App":
            return new App(id, name, properties, loadElements())
        case "Page":
            return new Page(id, name, properties, loadElements())
        case "Text":
            return new Text(id, name, properties)
        case "TextInput":
            return new TextInput(id, name, properties)
        default:
            const _exhaustiveCheck: never = kind
            return _exhaustiveCheck
    }

}

export function loadJSONFromString(json: string): Element {
    return loadJSON(JSON.parse(json))
}
