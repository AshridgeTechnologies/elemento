import {ElementType} from './Types'
import {startCase} from 'lodash'
import Page from './Page'
import Text from './Text'
import TextInput from './TextInput'
import NumberInput from './NumberInput'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import Button from './Button'
import UnsupportedValueError from '../util/UnsupportedValueError'
import Data from './Data'

export function createElement(elementType: ElementType, newIdSeq: number) {
    const id = `${elementType.toLowerCase()}_${newIdSeq}`
    const name = `${startCase(elementType)} ${newIdSeq}`

    switch (elementType) {
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
        case 'SelectInput':
            return new SelectInput(id, name, {values: []})
        case 'TrueFalseInput':
            return new TrueFalseInput(id, name, {})
        case 'Button':
            return new Button(id, name, {content: 'Do something'})
        case 'Data':
            return new Data(id, name, {})
        default:
            throw new UnsupportedValueError(elementType)
    }

}