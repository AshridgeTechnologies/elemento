import BaseElement, {propDef} from '../BaseElement'
import Element from '../Element'
import {ComponentType, ParentType, PropertyDef, PropertyValueType} from '../Types'

export interface RuleWithDescription {
    readonly description: PropertyValueType<string>
}

export class BuiltInRule implements RuleWithDescription {
    constructor(public description: string) {}
}

type Properties = {
    readonly description?: PropertyValueType<string>,
    readonly formula?: PropertyValueType<string>,
}
export default class Rule extends BaseElement<Properties> implements Element, RuleWithDescription {
    static kind = 'Rule'
    static get iconClass() { return 'rule_outlined' }

    static get parentType(): ParentType {
        return null
    }

    type(): ComponentType { return 'dataType' }

    get description() {return this.properties.description ?? this.name}
    get formula() {return this.properties.formula}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('description', 'string multiline'),
            propDef('formula', 'expr'),
        ]
    }

}