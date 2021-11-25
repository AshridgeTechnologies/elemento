import {ElementType} from './Types'
import Text from './Text'
import Page from './Page'
import TextInput from './TextInput'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {startCase} from 'lodash'

export function createElement(elementType: ElementType, newIdSeq: number) {
    const id = `${elementType.toLowerCase()}_${newIdSeq}`
    const name = `${startCase(elementType)} ${newIdSeq}`

    switch(elementType) {
        case 'App':
            throw new Error("Cannot create new App")
        case 'Page':
            return new Page(id, name, {}, [])
        case 'Text':
            return new Text(id, name, {contentExpr: '"Your text here"'})
        case 'TextInput':
            return new TextInput(id, name, {})
        default:
            throw new UnsupportedValueError(elementType)
    }

}