import BaseElement, {propDef} from './BaseElement'
import Element from './Element'
import {ComponentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'

type Properties = {
    readonly source?: PropertyValueType<string>,
    readonly width?: PropertyValueType<string | number>,
    readonly height?: PropertyValueType<string | number>,
    readonly marginBottom?: PropertyValueType<string | number>,
    readonly display?: PropertyValueType<boolean>,
    readonly description?: PropertyValueType<string>,
}

export default class Image extends BaseElement<Properties> implements Element {

    static kind = 'Image'

    static get iconClass() { return 'image' }

    get source() {return this.properties.source}
    get display() {return this.properties.display}
    get width() {return this.properties.width}
    get height() {return this.properties.height}
    get marginBottom() {return this.properties.marginBottom}
    get description() {return this.properties.description}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('source', 'string'),
            propDef('display', 'boolean'),
            propDef('width', 'string|number'),
            propDef('height', 'string|number'),
            propDef('marginBottom', 'string|number'),
            propDef('description', 'string'),
        ]
    }

    type(): ComponentType {
        return 'statelessUI'
    }
}