import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'
import FunctionDef from './FunctionDef'

type Properties = {  }

export default class ServerApp extends BaseElement<Properties> implements Element {

    readonly kind = 'ServerApp'
    get iconClass() { return 'webhook' }
    type(): ComponentType { return 'app' }

    get functions() {
        return this.elementArray().filter( el => el.kind === 'Function') as FunctionDef[]
    }

    get propertyDefs(): PropertyDef[] {
        return [
        ]
    }

    canContain(elementType: ElementType) {
        return ['Function', 'Collection', 'FirestoreDataStore'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }

}
