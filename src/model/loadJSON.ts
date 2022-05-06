import Element from './Element'
import Text from './Text'
import Page from './Page'
import App from './App'
import TextInput from './TextInput'
import {ElementId, ElementType} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import Button from './Button'
import NumberInput from './NumberInput'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import Data from './Data'
import Collection from './Collection'
import Project from './Project'
import List from './List'

export function loadJSON({id, kind, name, properties, elements}:
                             { id: ElementId, kind: ElementType, name: string, properties: any, elements?: any[] }): Element {

    const loadElements = () => (elements || []).map(el => loadJSON(el))

    switch(kind) {
    case 'Project':
        return new Project(id, name, properties, loadElements())
    case 'App':
        return new App(id, name, properties, loadElements())
    case 'Page':
        return new Page(id, name, properties, loadElements())
    case 'Text':
        return new Text(id, name, properties)
    case 'TextInput':
        return new TextInput(id, name, properties)
    case 'NumberInput':
        return new NumberInput(id, name, properties)
    case 'SelectInput':
        return new SelectInput(id, name, properties)
    case 'TrueFalseInput':
        return new TrueFalseInput(id, name, properties)
    case 'Button':
        return new Button(id, name, properties)
    case 'List':
        return new List(id, name, properties, loadElements())
    case 'Data':
        return new Data(id, name, properties)
    case 'Collection':
        return new Collection(id, name, properties)
    default:
        throw new UnsupportedValueError(kind)
    }

}

export function loadJSONFromString(json: string): Project {
    return loadJSON(JSON.parse(json)) as Project
}
