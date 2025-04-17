import {ComponentType, ElementId, ElementType, ParentType, PropertyDef} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'
import FunctionDef from './FunctionDef'

type Properties = {updateTime: Date}

export default class ServerApp extends BaseElement<Properties> implements Element {

    readonly kind = 'ServerApp'
    get iconClass() { return 'webhook' }
    type(): ComponentType { return 'app' }

    get updateTime() { return this.properties.updateTime }

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


    create(id: ElementId, name: string, properties: Properties, elements: ReadonlyArray<Element> | undefined): any {
        const propsWithUpdateTime = {...properties, updateTime: new Date()}
        return super.create(id, name, propsWithUpdateTime, elements);
    }

    static get parentType(): ParentType { return 'Project' }

}
