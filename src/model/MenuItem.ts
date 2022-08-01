import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement from './BaseElement'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'

type Properties = {
    readonly label?: PropertyValueType<string>,
    readonly action?: PropertyExpr,
    readonly display?: PropertyValueType<boolean>,
}

export default class MenuItem extends BaseElement<Properties> implements Element {

    static get iconClass() { return MenuOpenIcon }
    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get display() {return this.properties.display}
    get action() {return this.properties.action}

    get propertyDefs(): PropertyDef[] {
        return [
            {name: 'label', type: 'string'},
            {name: 'display', type: 'boolean'},
            {name: 'action', type: 'action'},
        ]
    }
}