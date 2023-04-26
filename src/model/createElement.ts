import lodash from 'lodash'; const {startCase} = lodash;
import {elementId} from '../util/helpers'

import {elementOfType} from './elements'
import {ElementType} from './Types'

export function createElement(elementType: ElementType, newIdSeq: number, properties: object = {}) {
    const id = elementId(elementType, newIdSeq)
    const {name, ...elementProps} = properties as any
    const elementName = name ?? `${startCase(elementType)} ${newIdSeq}`

    const elementClass = elementOfType(elementType)

    if (elementType === 'Project') {
        throw new Error('Cannot create new Project')
    }

    return new elementClass(id, elementName, elementProps, [])
}

export const elementHasParentTypeOf = (elementType: ElementType, thisEl: any) => {
    const parentType = elementOfType(elementType).parentType
    return parentType === thisEl.kind || parentType === 'any'
}