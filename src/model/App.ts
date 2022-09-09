import Page from './Page'
import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyValueType} from './Types'
import {elementOfType} from './elements'
import {without} from 'ramda'
import {Web} from '@mui/icons-material'


type Properties = { author?: PropertyValueType<string>, maxWidth?: PropertyValueType<string | number> }

export default class App extends BaseElement<Properties> implements Element {

    static kind = 'App'
    static get iconClass() { return Web }
    type(): ComponentType { return 'app' }

    get pages() {return this.elementArray().filter( el => el.kind === 'Page') as Page[]}
    get otherComponents() {return without(this.pages, this.elementArray())}
    get topChildren() {return this.otherComponents.filter( el => el.kind === 'AppBar')}
    get bottomChildren() {return without(this.topChildren, this.otherComponents) }

    get author() { return this.properties.author}
    get maxWidth() { return this.properties.maxWidth}
    get propertyDefs(): PropertyDef[] {
        return [
            {name: 'author', type: 'string'},
            {name: 'maxWidth', type: 'string|number'},
        ]
    }

    canContain(elementType: ElementType) {
        return elementOfType(elementType).parentType === this.kind || ['Collection', 'Function'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }

}
