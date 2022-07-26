import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementId, PropertyDef, PropertyValue, PropertyValueType} from './Types'

type Properties = {
    readonly content: PropertyValue,
    readonly style?: PropertyValue,
    readonly display?: PropertyValue,
    readonly fontSize?: PropertyValue,
    readonly fontFamily?: PropertyValueType<string>,
    readonly color?: PropertyValueType<string>,
    readonly backgroundColor?: PropertyValueType<string>,
    readonly border?: PropertyValueType<string | number>,
    readonly borderColor?: PropertyValueType<string>,
    readonly width?: PropertyValueType<string | number>,
    readonly height?: PropertyValueType<string | number>,
    readonly marginBottom?: PropertyValueType<string | number>,
}

export default class Text extends BaseElement<Properties> implements Element {
    constructor(
        id:  ElementId,
        name: string,
        properties: Properties
    ) {
        super(id, name, 'Text', properties)
    }

    static is(element: Element): element is Text {
        return element.constructor.name === this.name
    }

    type(): ComponentType { return 'statelessUI' }

    get content() {return this.properties.content}
    get style() {return this.properties.style}
    get display() {return this.properties.display}
    get fontSize() {return this.properties.fontSize}
    get fontFamily() {return this.properties.fontFamily}
    get color() {return this.properties.color}
    get backgroundColor() {return this.properties.backgroundColor}
    get border() {return this.properties.border}
    get borderColor() {return this.properties.borderColor}
    get width() {return this.properties.width}
    get height() {return this.properties.height}
    get marginBottom() {return this.properties.marginBottom}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string multiline'),
            propDef('display', 'boolean'),
            propDef('fontSize', 'number'),
            propDef('fontFamily'),
            propDef('color'),
            propDef('backgroundColor'),
            propDef('border', 'number'),
            propDef('borderColor'),
            propDef('width', 'string|number'),
            propDef('height', 'string|number'),
            propDef('marginBottom', 'string|number'),
        ]
    }

}
