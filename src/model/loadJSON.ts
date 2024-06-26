import Element from './Element'
import {ElementId, ElementType} from './Types'
import {isoDateReviver} from '../util/helpers'
import {createElement} from './createElement'
import Block, {BlockLayout} from './Block'

type ElementJson = { id: ElementId, kind: ElementType, name: string, properties: any, elements?: any[] }

function convertElementType(elementType: string, id: string, elementName: string, elementProps: {[p: string]: any}, elements?: any[]) {
    if (elementType === 'Layout') {
        const {horizontal, wrap, ...props} = elementProps
        const layout: BlockLayout = horizontal ? (wrap ? 'horizontal wrapped' : 'horizontal') : 'vertical'
        const newProps = {layout, ...props}
        const childElements = elements?.map(el => loadJSONElement(el))
        return new Block(id, elementName, newProps, childElements)
    }

    throw new Error('Cannot load element of type ' + elementType)
}

const isObsoleteType = (elementType: string) => ['Layout'].includes(elementType)

function loadJSONElement({id, kind, name, properties, elements}: ElementJson): Element {
    if (isObsoleteType(kind)) {
        return convertElementType(kind, id, name, properties, elements)
    }
    const childElements = elements?.map(el => loadJSONElement(el))
    return createElement(kind, id, name, properties, childElements)
}

export function loadJSON(json: ElementJson | ElementJson[]): Element | Element[] {
    if (Array.isArray(json)) {
        return json.map(loadJSONElement)
    }

    return loadJSONElement(json)
}

export function loadJSONFromString(json: string): Element | Element[] {
    return loadJSON(JSON.parse(json, isoDateReviver))
}
