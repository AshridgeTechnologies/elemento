import {ComponentType, PropertyDef, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'

type Properties = {
    readonly initialValue?: PropertyValueType<any>,
    readonly display?: PropertyValueType<boolean>,
}

export default class Data extends BaseElement<Properties> implements Element {

    static kind = 'Data'
    static get iconClass() { return 'note' }
    type(): ComponentType { return 'statefulUI' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', 'string', {state: true}),
            propDef('display', 'boolean'),
        ]
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'value'
        ])
    }
}
