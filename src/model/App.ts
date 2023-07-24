import {BaseApp} from './BaseApp'
import {ElementType} from './Types'
import {elementOfType, parentTypeOf} from './elements'

export default class App extends BaseApp {
    static kind = 'App'
    static get iconClass() { return 'web' }

    canContain(elementType: ElementType) {
        return this.appCanContain(elementType, parentTypeOf(elementType))
    }
}
