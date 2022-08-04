import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import Crop75 from '@mui/icons-material/Crop75'

type Properties = {
    readonly content?: PropertyValueType<string>,
    readonly action?: PropertyExpr,
    readonly filled?: PropertyValueType<boolean>,
    readonly style?: PropertyValueType<string>,
    readonly display?: PropertyValueType<boolean>,
}

export default class Button extends BaseElement<Properties> implements Element {

    readonly kind = 'Button'
    static get iconClass() { return Crop75 }
    static get initialProperties() { return {content: 'Do something'} }
    type(): ComponentType { return 'statelessUI' }

    get content() {return this.properties.content ?? this.name}
    get filled() {return this.properties.filled}
    get display() {return this.properties.display}
    get action() {return this.properties.action}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string'),
            propDef('filled', 'boolean'),
            propDef('display', 'boolean'),
            propDef('action', 'action'),
        ]
    }
}