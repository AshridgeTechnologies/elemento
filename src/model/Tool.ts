import {ElementType, ParentType} from './Types'

import {BaseApp} from './BaseApp'
import {elementOfType, parentTypeOf} from './elements'

export default class Tool extends BaseApp {

    static kind = 'Tool'
    static get iconClass() { return 'build_outlined' }
    static get parentType(): ParentType { return 'ToolFolder' }

    canContain(elementType: ElementType) {
        return this.appCanContain(elementType, parentTypeOf(elementType))
    }

}
