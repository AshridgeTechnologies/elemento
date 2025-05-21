import DataStore from '../DataStore'
import {DataStoreState} from './DataStoreState'
import TinyBaseDataStoreImpl from './TinyBaseDataStoreImpl'

type Properties = {path: string}

export default function TinyBaseDataStore({path}: Properties) {
    return null
}

export class TinyBaseDataStoreState extends DataStoreState {

    protected createDataStore(): DataStore {

        return new TinyBaseDataStoreImpl(this.props)
    }
}

TinyBaseDataStore.State = TinyBaseDataStoreState

