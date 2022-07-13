import {ElementType} from './Types'
import {startCase} from 'lodash'
import App from './App'
import Page from './Page'
import Text from './Text'
import TextInput from './TextInput'
import NumberInput from './NumberInput'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import Button from './Button'
import Menu from './Menu'
import MenuItem from './MenuItem'
import UnsupportedValueError from '../util/UnsupportedValueError'
import Data from './Data'
import Collection from './Collection'
import List from './List'
import MemoryDataStore from './MemoryDataStore'
import FileDataStore from './FileDataStore'
import Layout from './Layout'
import AppBar from './AppBar'
import FunctionDef from './FunctionDef'
import {elementId} from '../util/helpers'

export function createElement(elementType: ElementType, newIdSeq: number) {
    const id = elementId(elementType, newIdSeq)
    const name = `${startCase(elementType)} ${newIdSeq}`

    switch (elementType) {
    case 'Project':
        throw new Error('Cannot create new Project')
    case 'App':
        return new App(id, name, {}, [])
    case 'Page':
        return new Page(id, name, {}, [])
    case 'Layout':
        return new Layout(id, name, {}, [])
    case 'AppBar':
        return new AppBar(id, name, {}, [])
    case 'Text':
        return new Text(id, name, {content: 'Your text here'})
    case 'TextInput':
        return new TextInput(id, name, {})
    case 'NumberInput':
        return new NumberInput(id, name, {})
    case 'SelectInput':
        return new SelectInput(id, name, {values: []})
    case 'TrueFalseInput':
        return new TrueFalseInput(id, name, {})
    case 'Button':
        return new Button(id, name, {content: 'Do something'})
    case 'Menu':
        return new Menu(id, name, {})
    case 'MenuItem':
        return new MenuItem(id, name, {})
    case 'List':
        return new List(id, name, {items: []}, [])
    case 'Data':
        return new Data(id, name, {})
    case 'Collection':
        return new Collection(id, name, {})
    case 'MemoryDataStore':
        return new MemoryDataStore(id, name, {})
    case 'FileDataStore':
        return new FileDataStore(id, name, {})
    case 'Function':
        return new FunctionDef(id, name, {})
    default:
        throw new UnsupportedValueError(elementType)
    }

}