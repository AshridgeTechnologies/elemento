import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly initialValue?: PropertyValueType<any>,
    readonly display?: PropertyValueType<boolean>,
    readonly dataStore?: PropertyExpr,
    readonly collectionName?: string,
}

export default class Collection extends BaseElement<Properties> implements Element {

    static kind = 'Collection'
    static get iconClass() { return 'auto_awesome_motion' }
    type(): ComponentType { return 'statefulUI' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}
    get dataStore() {return this.properties.dataStore}
    get collectionName() {return this.properties.collectionName ?? this.codeName}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', 'expr', {state: true}),
            propDef('dataStore', 'expr', {state: true}),
            propDef('collectionName', 'string', {state: true}),
            propDef('display', 'boolean'),
        ]
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'value'
        ])
    }

}

