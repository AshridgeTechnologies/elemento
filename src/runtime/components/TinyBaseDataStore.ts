import DataStore from '../../shared/DataStore'
import {DataStoreState} from './DataStoreState'
import TinyBaseDataStoreImpl, {type Properties as DataStoreProperties} from './TinyBaseDataStoreImpl'
import {useEffect} from 'react'
import {useObject} from '../appStateHooks'

type Properties = {path: string}

export default function TinyBaseDataStore({path}: Properties) {
    const state: TinyBaseDataStoreState = useObject(path)

    useEffect(() => () => state.close(), [])
    return null
}

export class TinyBaseDataStoreState extends DataStoreState<DataStoreProperties> {

    close() {
        const store = this.state.dataStore as TinyBaseDataStoreImpl | undefined
        store?.close()
    }

    protected createDataStore(): DataStore {
        const store = new TinyBaseDataStoreImpl(this.props)
        store.init()
        return store
    }
}

TinyBaseDataStore.State = TinyBaseDataStoreState

