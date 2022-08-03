import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, ElementType, PropertyDef, PropertyValueType} from './Types'
import MemoryIcon from '@mui/icons-material/Memory'

type Properties = {
    readonly initialValue?: PropertyValueType<any>,
    readonly display?: PropertyValueType<boolean>,
}

export default class MemoryDataStore extends BaseElement<Properties> implements Element {

    static get iconClass() { return MemoryIcon }
    type(): ComponentType { return 'backgroundFixed' }

    get initialValue() {return this.properties.initialValue}
    get display() {return this.properties.display ?? false}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('initialValue', 'expr', {state: true}),
            propDef('display', 'boolean'),
        ]
    }

    static get parentType(): ElementType | 'any' | null { return 'App' }

}