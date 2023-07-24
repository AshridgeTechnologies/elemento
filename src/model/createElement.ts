import lodash, {isArray} from 'lodash'; const {startCase} = lodash;
import {elementId} from '../util/helpers'

import {elementOfType, parentTypeOf} from './elements'
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
    const parentType = parentTypeOf(elementType)
    return parentType === 'any' || parentType === thisEl.kind || isArray(parentType) && parentType.includes(thisEl.kind)
}