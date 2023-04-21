import BaseElement, {propDef} from '../BaseElement'
import Element from '../Element'
import {ComponentType, ParentType, PropertyDef, PropertyValueType} from '../Types'

type Properties = {
    readonly description?: PropertyValueType<string>,
    readonly formula?: PropertyValueType<string>,
}
export default class Rule extends BaseElement<Properties> implements Element {
    static kind = 'Rule'
    static get iconClass() { return 'rule_outlined' }

    static get parentType(): ParentType {
        return null
    }

    type(): ComponentType { return 'dataType' }

    get description() {return this.properties.description}
    get formula() {return this.properties.formula}

    get rules() { return [] }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('description', 'string multiline'),
            propDef('formula', 'expr'),
        ]
    }

}