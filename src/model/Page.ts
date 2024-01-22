import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementType, ParentType, PropertyDef, PropertyExpr} from './Types'
import {elementHasParentTypeOf} from './createElement'

type Properties = {notLoggedInPage?: PropertyExpr}

export default class Page extends BaseElement<Properties> implements Element {

    static kind = 'Page'
    static get iconClass() { return 'web' }
    type(): ComponentType { return 'statefulUI' }
    get notLoggedInPage() { return this.properties.notLoggedInPage}

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return 'App' }

    get propertyDefs(): PropertyDef[] { return [
        propDef('notLoggedInPage', 'expr'),
    ] }

}
