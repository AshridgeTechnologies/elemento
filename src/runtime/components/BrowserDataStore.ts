import IdbDataStoreImpl, {Properties as DataStoreProperties} from './IdbDataStoreImpl'
import DataStore from '../../shared/DataStore'
import {DataStoreState} from './DataStoreState'
import {equals} from 'ramda'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'
import {useComponentState} from '../state/appStateHooks'

type StateProperties = DataStoreProperties
type Properties = {path: string} & StateProperties

const BrowserDataStoreSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Browserdatastore",
    "description": "Description of BrowserDataStore",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "BrowserDataStore",
    "icon": "sd_storage",
    "elementType": "statefulUI",
    "parentType": "App",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "databaseName": {
                    "description": "The ",
                    "type": "string"
                },
                "collectionNames": {
                    "description": "The ",
                    "$ref": "#/definitions/StringList"
                }
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const BrowserDataStoreMetadata = {
    stateProps: ['databaseName', 'collectionNames']
}


export default function BrowserDataStore({path, ...stateProps}: Properties) {
    useComponentState(path, BrowserDataStoreState, stateProps)
    return null
}

export class BrowserDataStoreState extends DataStoreState<DataStoreProperties> {

    protected createDataStore(): DataStore {
        return new IdbDataStoreImpl(this.props)
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(newObj.props, this.props)
    }

    protected async initDataStore() {
        return this.state.dataStore as IdbDataStoreImpl
    }

    protected async closeDataStore() {
    }

}

BrowserDataStore.State = BrowserDataStoreState
BrowserDataStore.Schema = BrowserDataStoreSchema
BrowserDataStore.Metadata = BrowserDataStoreMetadata
