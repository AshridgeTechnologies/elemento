import {BaseApp} from './BaseApp'
import {ElementType} from './Types'
import {parentTypeOf} from './elements'

export default class App extends BaseApp {
    readonly kind = 'App'
    get iconClass() { return 'web' }

    canContain(elementType: ElementType) {
        return this.appCanContain(elementType, parentTypeOf(elementType))
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'currentPage'
        ])
    }

}
