import {ElementType} from './Types'
import Text from './Text'
import Page from './Page'
import TextInput from './TextInput'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {startCase} from 'lodash'
import Button from './Button'
import NumberInput from './NumberInput'

export function createElement(elementType: ElementType, newIdSeq: number) {
    const id = `${elementType.toLowerCase()}_${newIdSeq}`
    const name = `${startCase(elementType)} ${newIdSeq}`

    switch(elementType) {
        case 'App':
            throw new Error("Cannot create new App")
        case 'Page':
            return new Page(id, name, {}, [])
        case 'Text':
            return new Text(id, name, {content: 'Your text here'})
        case 'TextInput':
            return new TextInput(id, name, {})
        case 'NumberInput':
            return new NumberInput(id, name, {})
        case 'Button':
            return new Button(id, name, {content: 'Do something'})
        default:
            throw new UnsupportedValueError(elementType)
    }

}