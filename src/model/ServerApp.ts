import {ComponentType, ElementType, ParentType, PropertyDef} from './Types'
import BaseElement from './BaseElement'
import Element from './Element'
import {Webhook} from '@mui/icons-material'

type Properties = {  }

export default class ServerApp extends BaseElement<Properties> implements Element {

    static kind = 'ServerApp'
    static get iconClass() { return Webhook }
    type(): ComponentType { return 'app' }


    get propertyDefs(): PropertyDef[] {
        return [
        ]
    }

    canContain(elementType: ElementType) {
        return ['Function'].includes(elementType)
    }

    static get parentType(): ParentType { return 'Project' }

}