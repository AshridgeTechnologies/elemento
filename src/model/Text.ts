import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'
import {ComponentType, ElementType, PropertyDef, PropertyValue, Show, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = Partial<Readonly<{
    content: PropertyValue,
    allowHtml: boolean
}>> & Styling & Show

export default class Text extends BaseElement<Properties> implements Element {

    readonly kind = 'Text'
    static get initialProperties() { return {content: 'Your text here'} }
    get iconClass() { return 'subject' }

    type(): ComponentType { return 'statelessUI' }
    isLayoutOnly() { return true }

    get content() {return this.properties.content}
    get allowHtml() {return this.properties.allowHtml}
    get styles() {return this.properties.styles}
    get show() {return this.properties.show}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string multiline'),
            propDef('allowHtml', 'boolean', {fixedOnly: true}),
            ...visualPropertyDefs()
        ]
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }
}
