import {ComponentType, ElementId, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly initialValue?: PropertyValueType<any>,
    readonly display?: PropertyValueType<boolean>,
    readonly dataStore?: PropertyExpr,
    readonly collectionName?: string,
}

export default class Collection extends BaseElement<Properties> implements Element {
    constructor(
        id: ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, 'Collection', properties)
    }

    static is(element: Element): element is Collection {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statefulUI' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}
    get dataStore() {return this.properties.dataStore}
    get collectionName() {return this.properties.collectionName}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', 'expr', {state: true}),
            propDef('dataStore', 'expr', {state: true}),
            propDef('collectionName', 'string', {state: true}),
            propDef('display', 'boolean'),
        ]
    }

}

