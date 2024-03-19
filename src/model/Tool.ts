import {ElementType, ParentType, PropertyDef} from './Types'
import type {Properties as BaseAppProperties} from './BaseApp'

import {BaseApp} from './BaseApp'
import {parentTypeOf} from './elements'

type ToolProperties = BaseAppProperties & {showWhenProjectOpened?: boolean}
export default class Tool extends BaseApp<ToolProperties> {

    readonly kind = 'Tool'
    get iconClass() { return 'build_outlined' }
    static get parentType(): ParentType { return 'ToolFolder' }

    get showWhenProjectOpened() {
        return this.properties.showWhenProjectOpened
    }

    get propertyDefs(): PropertyDef[] {
        return [...super.propertyDefs,
            {name: 'showWhenProjectOpened', type: 'boolean'},
        ]
    }

    canContain(elementType: ElementType) {
        return this.appCanContain(elementType, parentTypeOf(elementType))
    }

}
