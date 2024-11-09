import lodash, {isArray} from 'lodash'; const {startCase} = lodash
import Element from './Element'
import {elementId} from '../util/helpers'
import {elementOfType, isBuiltInType, parentTypeOf} from './elements'
import {ElementType} from './Types'
import ComponentInstance from './ComponentInstance'

export function createElement(elementType: ElementType, id: string, elementName: string, elementProps: {[p: string]: any}, elements?: Element[]) {
    if (isBuiltInType(elementType)) {
        const elementClass = elementOfType(elementType)
        return new elementClass(id, elementName, elementProps, elements)
    }

    return new ComponentInstance(id, elementName, {...elementProps, componentType: elementType}, elements)
}

export function createNewElement(elementType: ElementType, newIdSeq: number, properties: object = {}) {
    const id = elementId(elementType, newIdSeq)
    const {name, ...elementProps} = properties as any
    const elementName = name ?? `${startCase(elementType)} ${newIdSeq}`

    if (elementType === 'Project') {
        throw new Error('Cannot create new Project')
    }

    return createElement(elementType, id, elementName, elementProps)
}

export const elementHasParentTypeOf = (elementType: ElementType, thisEl: any) => {
    const parentType = parentTypeOf(elementType)
    return parentType === 'any' || parentType === thisEl.kind || isArray(parentType) && parentType.includes(thisEl.kind)
}
