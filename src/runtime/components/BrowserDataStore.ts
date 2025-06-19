import IdbDataStoreImpl, {Properties as DataStoreProperties} from './IdbDataStoreImpl'
import DataStore from '../../shared/DataStore'
import {DataStoreState} from './DataStoreState'
import {equals} from 'ramda'

type Properties = {path: string}

export default function BrowserDataStore(_props: Properties) {
    return null
}

export class BrowserDataStoreState extends DataStoreState<DataStoreProperties> {

    protected createDataStore(): DataStore {
        return new IdbDataStoreImpl(this.props)
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(newObj.props, this.props)
    }
}

BrowserDataStore.State = BrowserDataStoreState
