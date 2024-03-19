import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'

import {BaseApp} from './BaseApp'
import {elementOfType, parentTypeOf} from './elements'
import BaseElement, {propDef} from './BaseElement'
type Properties = Partial<Readonly<{
    source: string,
    studioAccess: boolean
}>>
export default class ToolImport extends BaseElement<Properties> {

    readonly kind = 'ToolImport'
    get iconClass() { return 'build_circle' }
    static get parentType(): ParentType { return 'ToolFolder' }

        type(): ComponentType { return 'utility' }

        get source() {return this.properties.source}
        get studioAccess() {return this.properties.studioAccess}

        get propertyDefs(): PropertyDef[] {
            return [
                propDef('source', 'string'),
                propDef('studioAccess', 'boolean'),
            ]
        }

}
