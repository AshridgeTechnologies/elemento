import BaseElement, {propDef} from "./BaseElement";
import Element from "./Element";
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyExpr} from "./Types";

type Properties = {
    readonly source?: string
    readonly exportName?: string
}

export default class FunctionImport extends BaseElement<Properties> implements Element{

    get iconClass() { return 'label_important' }
    kind: ElementType = 'FunctionImport'
    type(): ComponentType { return 'utility' }
    static get parentType(): ParentType { return ['App', 'Page'] }

    get source() { return this.properties.source}
    get exportName() { return this.properties.exportName}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('source', 'string', {fixedOnly: true}),
            propDef('exportName', 'string', {fixedOnly: true}),
        ]
    }


}
