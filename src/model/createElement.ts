import {ElementType} from './Types'
import {startCase} from 'lodash'
import {elementId} from '../util/helpers'

import * as theElements from './elements'

export function createElement(elementType: ElementType, newIdSeq: number) {
    const id = elementId(elementType, newIdSeq)
    const name = `${startCase(elementType)} ${newIdSeq}`

    const elementClass = theElements[elementType]

    if (elementType === 'Project') {
        throw new Error('Cannot create new Project')
    }

    return new elementClass(id, name, {}, [])
}