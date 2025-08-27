import {ElementId} from '../../src/model/Types'
import Element from '../../src/model/Element'
import {type ElementSchema, modelElementClass} from '../../src/model/ModelElement'
import {TextElementSchema} from '../../src/runtime/components/TextElement'
import {TextInputSchema} from '../../src/runtime/components/TextInput'
import {BlockSchema} from '../../src/runtime/components/Block'
import BaseInputElement from '../../src/model/BaseInputElement'
import {ItemSetMetadata, ItemSetSchema} from '../../src/runtime/components/ItemSet'

export const textInputClass = modelElementClass(<ElementSchema>TextInputSchema)
export const newTextInput = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new textInputClass(id, name, properties, elements) as BaseInputElement<any>

export const textClass = modelElementClass(TextElementSchema)
export const newText = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new textClass(id, name, properties, elements)

export const blockClass = modelElementClass(BlockSchema)
export const newBlock = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new blockClass(id, name, properties, elements)

export const itemSetClass = modelElementClass(ItemSetSchema, ItemSetMetadata)
export const newItemSet = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new itemSetClass(id, name, properties, elements)
