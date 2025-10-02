import {BaseComponentState, placeholder, StoredState, withUpdatedProps, wrapComponentState} from '../state/BaseComponentState'
import AppStateStore from '../state/AppStateStore'
import SubscribableStore from '../state/SubscribableStore'
import {wrapFn} from '../debug'

export default class ElementoComponentState<ExternalProps extends object, StateProps extends object = ExternalProps>
    extends BaseComponentState<ExternalProps & {app?: StoredState}, StateProps> {

    get app() { return this.props.app}
}


export class ElementoStateStore extends AppStateStore {
    constructor() {
        super(new SubscribableStore(), wrapComponentState(wrapFn), withUpdatedProps, placeholder)
    }

}
