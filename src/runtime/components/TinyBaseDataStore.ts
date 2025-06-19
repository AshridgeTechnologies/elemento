import DataStore from '../../shared/DataStore'
import {DataStoreState} from './DataStoreState'
import TinyBaseDataStoreImpl from './TinyBaseDataStoreImpl'

type Properties = {path: string}
import {type Properties as DataStoreProperties} from './TinyBaseDataStoreImpl'

export default function TinyBaseDataStore(_props: Properties) {
    return null
}

export class TinyBaseDataStoreState extends DataStoreState<DataStoreProperties> {

    protected createDataStore(): DataStore {
        return new TinyBaseDataStoreImpl(this.props)
    }
}

TinyBaseDataStore.State = TinyBaseDataStoreState

