import IdbDataStoreImpl from './IdbDataStoreImpl'
import DataStore from '../DataStore'
import {DataStoreState} from './DataStoreState'
import {parseCollections} from '../../shared/CollectionConfig'

type Properties = {path: string}

export default function BrowserDataStore({path}: Properties) {
    return null
}

export class BrowserDataStoreState extends DataStoreState {

    protected createDataStore(): DataStore {
        const collectionNames = parseCollections(this.props.collections).map( conf => conf.name )
        const {databaseName} = this.props
        return new IdbDataStoreImpl({collectionNames, databaseName})
    }
}

BrowserDataStore.State = BrowserDataStoreState

