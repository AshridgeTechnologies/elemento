import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyExpr, Styling} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = {notLoggedInPage?: PropertyExpr} & Styling

export default class Page extends BaseElement<Properties> implements Element {

    static kind = 'Page'
    static get iconClass() { return 'web' }
    type(): ComponentType { return 'statefulUI' }
    get notLoggedInPage() { return this.properties.notLoggedInPage}
    get styles() { return this.properties.styles}

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return 'App' }

    get propertyDefs(): PropertyDef[] { return [
        propDef('notLoggedInPage', 'expr'),
        propDef('styles', 'styles'),
    ] }

}
