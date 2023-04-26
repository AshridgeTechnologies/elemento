import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef} from '../Types'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'
type Properties = BaseTypeProperties & {
    readonly values?: string[],
    readonly valueNames?: string[],
}

export default class ChoiceType extends BaseTypeElement<Properties> implements Element {

    static kind = 'ChoiceType'
    static get iconClass() { return 'menu_open_outlined' }

    get values() {return this.properties.values || []}
    get valueNames() {return this.properties.valueNames || []}

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('values', 'string list'),
            propDef('valueNames', 'string list'),
        ])
    }
}
