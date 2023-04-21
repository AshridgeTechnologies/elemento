import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef} from '../Types'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'

const formatChoices = ['email', 'url', 'multiline'] as const
type Properties = BaseTypeProperties & {
    readonly values?: string[],
}

export default class EnumType extends BaseTypeElement<Properties> implements Element {

    static kind = 'EnumType'
    static get iconClass() { return 'menu_open_outlined' }

    get values() {return this.properties.values || []}

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('values', 'string list'),
        ])
    }
}
