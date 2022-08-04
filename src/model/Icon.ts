import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import SentimentSatisfied from '@mui/icons-material/SentimentSatisfied';

type Properties = {
    readonly iconName?: PropertyValueType<string>,
    readonly label?: PropertyValueType<string>,
    readonly color?: PropertyValueType<string>,
    readonly fontSize?: PropertyValueType<string | number>,
    readonly action?: PropertyExpr,
    readonly display?: PropertyValueType<boolean>,
}

export default class Icon extends BaseElement<Properties> implements Element {

    readonly kind = 'Icon'
    static get iconClass() { return SentimentSatisfied }
    static get initialProperties() { return {iconName: 'sentiment_satisfied'} }
    type(): ComponentType { return 'statelessUI' }

    get iconName() {return this.properties.iconName}
    get label() {return this.properties.label}
    get color() {return this.properties.color}
    get fontSize() {return this.properties.fontSize}
    get display() {return this.properties.display}
    get action() {return this.properties.action}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('iconName', 'string'),
            propDef('label', 'string'),
            propDef('action', 'action'),
            propDef('display', 'boolean'),
            propDef('color', 'string'),
            propDef('fontSize', 'number'),
        ]
    }
}

