import {ElementType, ParentType} from './Types'
import type {Properties as BaseAppProperties} from './BaseApp'
import {BaseApp} from './BaseApp'
import {parentTypeOf} from './elements'

type ToolProperties = BaseAppProperties
export default class Tool extends BaseApp<ToolProperties> {

    readonly kind = 'Tool'
    get iconClass() { return 'build_outlined' }
    static get parentType(): ParentType { return 'ToolFolder' }

    canContain(elementType: ElementType) {
        return this.appCanContain(elementType, parentTypeOf(elementType))
    }

}
