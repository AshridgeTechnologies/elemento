import {ComponentType, ElementType, PropertyDef, ParentType} from './Types'
import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {elementHasParentTypeOf} from './createElement'

type Properties = Partial<Readonly<{
    input1: string,
    input2: string,
    input3: string,
    input4: string,
    input5: string,
}>>

export default class ComponentDef extends BaseElement<Properties> implements Element {

    get iconClass() { return 'extension' }
    kind: ElementType = 'Component'
    type(): ComponentType { return 'utility' }

    get input1() { return this.properties.input1}
    get input2() { return this.properties.input2}
    get input3() { return this.properties.input3}
    get input4() { return this.properties.input4}
    get input5() { return this.properties.input5}
    get inputs() { return [this.input1, this.input2, this.input3, this.input4, this.input5].filter( p => !!p) as string[]}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('input1', 'string', {fixedOnly: true}),
            propDef('input2', 'string', {fixedOnly: true}),
            propDef('input3', 'string', {fixedOnly: true}),
            propDef('input4', 'string', {fixedOnly: true}),
            propDef('input5', 'string', {fixedOnly: true}),
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return 'ComponentFolder' }

    // get instanceParentType() { return 'any'}
}
