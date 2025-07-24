import {DataStoreState} from './DataStoreState'
import TinyBaseDataStoreImpl, {type Properties as DataStoreProperties} from './TinyBaseDataStoreImpl'
import {useEffect} from 'react'
import {useObject} from '../appStateHooks'
import {AppStateForObject} from './ComponentState'

type Properties = {path: string}

export default function TinyBaseDataStore({path}: Properties) {
    const state: TinyBaseDataStoreState = useObject(path)

    useEffect(() => () => state.close(), [])
    return null
}

export class TinyBaseDataStoreState extends DataStoreState<DataStoreProperties> {

    close() {
        (this.state.dataStore as TinyBaseDataStoreImpl)?.close()
    }

    protected createDataStore() {
        return new TinyBaseDataStoreImpl(this.props)
    }

    protected async initDataStore() {
        return (this.state.dataStore as TinyBaseDataStoreImpl).init()
    }

    protected async closeDataStore() {
        const existingDataStore  = (this.state.dataStore as TinyBaseDataStoreImpl | undefined)
        await existingDataStore?.close()
    }
}

TinyBaseDataStore.State = TinyBaseDataStoreState

