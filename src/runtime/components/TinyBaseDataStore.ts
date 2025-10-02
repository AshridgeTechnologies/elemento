import {DataStoreState} from './DataStoreState'
import TinyBaseDataStoreImpl, {type Properties as DataStoreProperties} from './TinyBaseDataStoreImpl'
import {useEffect} from 'react'
import {useComponentState} from '../state/appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = {path: string}

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
                        "argNames": [
                        "$userId",
                        "$tableId",
                        "$rowId",
                        "$changes"
                    ]
                },
                "serverUrl": {
                    "description": "The ",
                        "$ref": "#/definitions/StringOrExpression"
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

export const TinyBaseDataStoreMetadata: ElementMetadata = {
    stateProps:['collections', 'storeOnDevice', 'syncWithServer', 'databaseName', 'authorizeUser', 'authorizeData', 'serverUrl']
}

export default function TinyBaseDataStore({path}: Properties) {
    const state = useComponentState(path, TinyBaseDataStoreState)

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
TinyBaseDataStore.Schema = TinyBaseDataStoreSchema
TinyBaseDataStore.Metadata = TinyBaseDataStoreMetadata

