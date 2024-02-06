import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, PropertyDef, PropertyValue, PropertyValueType, Show, Styling} from './Types'

type Properties = Partial<Readonly<{
    content: PropertyValue,
}>> & Styling & Show

export default class Text extends BaseElement<Properties> implements Element {

    static kind = 'Text'
    static get initialProperties() { return {content: 'Your text here'} }
    static get iconClass() { return 'subject' }

    type(): ComponentType { return 'statelessUI' }

    get content() {return this.properties.content}
    get styles() {return this.properties.styles}
    get show() {return this.properties.show}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('content', 'string multiline'),
            propDef('show', 'boolean'),
            propDef('styles', 'styles')
        ]
    }

}
