import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'
import {elementHasParentTypeOf} from './createElement'
import Project from './Project'

type Properties = {}

export default class ComponentDef extends BaseElement<Properties> implements Element {

    get iconClass() { return 'extension' }
    kind: ElementType = 'Component'
    type(): ComponentType { return 'utility' }

    get propertyDefs(): PropertyDef[] {
        return []
    }

    canContain(elementType: ElementType) {
        return elementHasParentTypeOf(elementType, this)
    }

    static get parentType(): ParentType { return 'ComponentFolder' }

    isStateful(project: Project): boolean {
        const requiresState = (el: Element) => el.kind === 'OutputProperty' || project.componentTypeIs(el, 'statefulUI', 'background')
        return this.elementArray().some( requiresState )
    }

    instanceType(project: Project): ComponentType {
        return this.isStateful(project) ? 'statefulUI' : 'statelessUI'
    }
}
