import {startCase} from 'lodash'
import {elementId} from '../util/helpers'

import {elementOfType} from './elements'
import {ElementType} from './Types'

export function createElement(elementType: ElementType, newIdSeq: number) {
    const id = elementId(elementType, newIdSeq)
    const name = `${startCase(elementType)} ${newIdSeq}`

    const elementClass = elementOfType(elementType)

    if (elementType === 'Project') {
        throw new Error('Cannot create new Project')
    }

    return new elementClass(id, name, {}, [])
}