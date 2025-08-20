import {expect, test} from "vitest"
import {Schema as TextInput_Schema} from '../../src/runtime/components/TextInput'
import {type ElementSchema, modelElementClass} from '../../src/model/ModelElement'
import {propDef} from '../../src/model/BaseElement'
import {eventAction, PropertyType} from '../../src/model/Types'
import BaseInputElement from '../../src/model/BaseInputElement'

test('Model element has correct properties', async ()=> {
    const modelClass = modelElementClass(TextInput_Schema as ElementSchema)
    expect(modelClass.name).toBe('TextInput')

    const element = new modelClass('textInput_1', 'Text Input 1', {multiline: true, keyAction: {expr: 'DoSomething()'}})
    expect(element.kind).toBe('TextInput')
    expect(element.iconClass).toBe('crop_16_9')
    expect(element.valueType).toBe('string')
    expect(element.type()).toBe('statefulUI')
    expect(element.id).toBe('textInput_1')
    expect(element.name).toBe('Text Input 1')

    // @ts-ignore
    expect(element.ownPropertyDefs()).toEqual([
        propDef('multiline', 'boolean'),
        propDef('keyAction', eventAction('$event'))
    ])

    expect((element as any).multiline).toBe(true)
    expect((element as any).keyAction).toEqual({expr: 'DoSomething()'})
})

test('caches element classes', () => {
    const class1 = modelElementClass(TextInput_Schema as ElementSchema)
    const class2 = modelElementClass(TextInput_Schema as ElementSchema)
    expect(class2).toBe(class1)
})

test('Model class properties do not affect BaseInputElement prototype', async ()=> {
    modelElementClass(TextInput_Schema as ElementSchema)

    const BaseInputElementClass = BaseInputElement
    expect(BaseInputElementClass.prototype).not.toHaveProperty('multiline')

    const ClassA = class extends BaseInputElement<any> {
        readonly iconClass = 'icon1'
        readonly kind = 'TextInput'

        get valueType(): PropertyType {
            return 'string'
        }
    }

    expect(ClassA.prototype).not.toHaveProperty('multiline')
    const a = new ClassA('1d1', 'A1', {multiline: true})
    expect(a).not.toHaveProperty('multiline')
    // @ts-ignore
    expect(a.multiline).toBeUndefined()
})
