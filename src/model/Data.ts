import {ComponentType, PropertyDef, PropertyValue} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import NoteIcon from '@mui/icons-material/Note'

type Properties = {
    readonly initialValue?: PropertyValue,
    readonly display?: PropertyValue,
}

export default class Data extends BaseElement<Properties> implements Element {

    readonly kind = 'Data'
    static get iconClass() { return NoteIcon }
    type(): ComponentType { return 'statefulUI' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', 'string', {state: true}),
            propDef('display', 'boolean'),
        ]
    }

}