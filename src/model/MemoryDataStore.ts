import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyValueType} from './Types'

type Properties = {
    readonly initialValue?: PropertyValueType<any>,
    readonly display?: PropertyValueType<boolean>,
}

export default class MemoryDataStore extends BaseElement<Properties> implements Element {

    static kind = 'MemoryDataStore'
    static get iconClass() { return 'memory' }
    type(): ComponentType { return 'backgroundFixed' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', 'expr', {state: true}),
            propDef('display', 'boolean'),
        ]
    }

    static get parentType(): ParentType { return 'App' }

}