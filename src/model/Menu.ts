import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import MenuIcon from '@mui/icons-material/Menu'

type Properties = {
    readonly label?: PropertyValueType<string>,
    readonly filled?: PropertyValueType<boolean>,
}

export default class Menu extends BaseElement<Properties> implements Element {

    readonly kind = 'Menu'
    static get iconClass() { return MenuIcon }
    type(): ComponentType { return 'statelessUI' }

    get label() {return this.properties.label ?? this.name}
    get filled() {return this.properties.filled}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('label', 'string'),
            propDef('filled', 'boolean'),
        ]
    }

    canContain(elementType: ElementType) {
        return ['MenuItem'].includes(elementType)
    }

}