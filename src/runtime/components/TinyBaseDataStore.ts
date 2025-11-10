import {DataStoreState} from './DataStoreState'
import TinyBaseDataStoreImpl, {Properties as StoreImplProps} from './TinyBaseDataStoreImpl'
import {useEffect} from 'react'
import {useComponentState} from '../state/appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

export type DataStoreProperties = {collections: string, storeOnDevice?: boolean, syncWithServer?: boolean, databaseName?: string, databaseType?: string,
    authorizeUser?: () => Promise<string>, authorizeData?: () => boolean, serverUrl?: string}
type Properties = {path: string} & DataStoreProperties

export const TinyBaseDataStoreSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Tinybasedatastore",
        "description": "Description of TinyBaseDataStore",
        "type": "object",
        "$ref": "#/definitions/BaseElement",
        "kind": "TinyBaseDataStore",
        "icon": "token",
        "elementType": "statefulUI",
        "parentType": "App",
        "properties": {
        "properties": {
            "type": "object",
                "unevaluatedProperties": false,
                "properties": {
                "collections": {
                    "description": "The ",
                        "$ref": "#/definitions/StringMultiline"
                },
                "storeOnDevice": {
                    "description": "The ",
                        "type": "boolean"
                },
                "syncWithServer": {
                    "description": "The ",
                        "type": "boolean"
                },
                "databaseName": {
                    "description": "The ",
                        "$ref": "#/definitions/StringOrExpression"
                },
                "authorizeUser": {
                    "description": "The ",
                        "$ref": "#/definitions/ActionExpression",
                        "argNames": [
                        "$userId"
                    ]
                },
                "authorizeData": {
                    "description": "The ",
                        "$ref": "#/definitions/ActionExpression",
                        "argNames": ["$userId", "$tableId", "$rowId", "$changes"]
                },
                "serverUrl": {
                    "description": "The ",
                        "$ref": "#/definitions/StringOrExpression"
                },
                "databaseType": {
                    "description": "The name of the Durable object to sync with",
                    "$ref": "#/definitions/StringOrExpression"
                },
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

export const TinyBaseDataStoreMetadata: ElementMetadata = {
    stateProps:['collections', 'storeOnDevice', 'syncWithServer', 'databaseName', 'authorizeUser', 'authorizeData', 'serverUrl']
}

const DEFAULT_DB_NAME = 'DB'
const DEFAULT_TYPE_NAME = 'DO'

export default function TinyBaseDataStore({path, ...storeProps}: Properties) {
    const state = useComponentState(path, TinyBaseDataStoreState, storeProps)

    useEffect(() => () => state.close(), [])
    return null
}

export class TinyBaseDataStoreState extends DataStoreState<DataStoreProperties> {

    close() {
        (this.state.dataStore as TinyBaseDataStoreImpl)?.close()
    }

    protected createDataStore() {
        const storeProps: StoreImplProps = {
            collections: this.props.collections,
            databaseInstanceName: this.props.databaseName ?? DEFAULT_DB_NAME,
            databaseTypeName: this.props.databaseType ?? DEFAULT_TYPE_NAME,
            persist: this.props.storeOnDevice,
            sync: this.props.syncWithServer,
            syncServer: this.props.serverUrl
        }
        return new TinyBaseDataStoreImpl(storeProps)
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
TinyBaseDataStore.Schema = TinyBaseDataStoreSchema
TinyBaseDataStore.Metadata = TinyBaseDataStoreMetadata

