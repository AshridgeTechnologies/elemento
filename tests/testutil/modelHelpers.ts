import {ElementId} from '../../src/model/Types'
import Element from '../../src/model/Element'
import {ElementSchema, modelElementClass} from '../../src/model/ModelElement'
import {Schema as TextInput_Schema} from '../../src/runtime/components/TextInput'

export const textInputClass = modelElementClass(<ElementSchema>TextInput_Schema)
export const newTextInput = (id: ElementId,
                      name: string,
                      properties: object,
                      elements: ReadonlyArray<Element> | undefined = undefined,
) => new textInputClass(id, name, properties, elements)
