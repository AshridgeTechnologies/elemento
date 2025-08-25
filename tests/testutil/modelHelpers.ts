import {ElementId} from '../../src/model/Types'
import Element from '../../src/model/Element'
import {type ElementSchema, modelElementClass} from '../../src/model/ModelElement'
import {Schema as Text_Schema} from '../../src/runtime/components/TextElement'
import {Schema as TextInput_Schema} from '../../src/runtime/components/TextInput'
import {Schema as Block_Schema} from '../../src/runtime/components/Block'
import BaseInputElement from '../../src/model/BaseInputElement'

export const textInputClass = modelElementClass(<ElementSchema>TextInput_Schema)
export const newTextInput = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new textInputClass(id, name, properties, elements) as BaseInputElement<any>

export const textClass = modelElementClass(Text_Schema)
export const newText = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new textClass(id, name, properties, elements)

export const blockClass = modelElementClass(Block_Schema)
export const newBlock = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new blockClass(id, name, properties, elements)
