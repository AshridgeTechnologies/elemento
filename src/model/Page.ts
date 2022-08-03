import Element from './Element'
import BaseElement from './BaseElement'
import {ComponentType, ElementType, PropertyDef} from './Types'
import * as theElements from './elements'
import {Web} from '@mui/icons-material'

type Properties = {}

export default class Page extends BaseElement<Properties> implements Element {

    static get iconClass() { return Web }
    type(): ComponentType { return 'statefulUI' }

    canContain(elementType: ElementType) {
        const parentType = theElements[elementType].parentType
        return parentType === this.kind || parentType === 'any'
    }

    static get parentType(): ElementType | 'any' | null { return 'App' }

    get propertyDefs(): PropertyDef[] { return [] }

}