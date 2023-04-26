import BaseElement, {propDef} from '../BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from '../Types'
import Rule, {BuiltInRule, RuleWithDescription} from './Rule'

export type BaseTypeProperties = {
    readonly basedOn?: PropertyExpr,
    readonly description?: PropertyValueType<string>,
    readonly required?: boolean,
}

export const standardRequiredRule = new BuiltInRule('Required')
export const standardOptionalRule = new BuiltInRule('Optional')
const requiredRule = (required: boolean) => required ? standardRequiredRule : standardOptionalRule

export default abstract class BaseTypeElement<PropertiesType extends BaseTypeProperties> extends BaseElement<PropertiesType> {

    static isDataType() { return true }

    static get parentType(): ParentType {
        return null
    }

    type(): ComponentType { return 'dataType' }

    get basedOn() {return this.properties.basedOn}
    get description() {return this.properties.description}
    get required() {return this.properties.required ?? false}

    canContain(elementType: ElementType) {
        return ['Rule'].includes(elementType)
    }

    get rulesFromProperties(): RuleWithDescription[] { return [] }
    get rules(): (Rule | BuiltInRule | RuleWithDescription)[] {
        const additionalElements = this.findChildElements(Rule)
        return [ ...this.rulesFromProperties, ...additionalElements, requiredRule(this.required)]
    }

    get ruleDescriptions() {
        return this.rules.map( r => r.description)
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('basedOn', 'expr'),
            propDef('description', 'string multiline'),
            propDef('required', 'boolean'),
        ]
    }

}
