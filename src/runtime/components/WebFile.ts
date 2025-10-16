import {BaseComponentState, ComponentState} from './ComponentState'
import appFunctions from '../appFunctions'
import {ErrorResult, pending} from '../../shared/DataStore'
import {equals, mergeRight, omit} from 'ramda'
import {isObject} from 'lodash'
import {globalFetch} from './ComponentHelpers'
import {Definitions} from '../../model/schema'
import {ElementSchema} from '../../model/ModelElement'

type Properties = {path: string}
type ExternalProperties = {url: string}
type StateProperties = {resultCache: object}

export const WebFileSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Webfile",
    "description": "Description of WebFile",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "WebFile",
    "icon": "insert_drive_file",
    "elementType": "background",
    "parentType": [
    "App",
    "Page"
],
    "properties": {
    "properties": {
        "type": "object",
            "unevaluatedProperties": false,
            "properties": {
            "url": {
                "description": "The ",
                    "type": "string"
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

export const WebFileMetadata = {
    stateProps: ['url']
}

export default function WebFile(_props: Properties) {
    return null
}

export class WebFileState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState {

    private get url() { return this.props.url}
    private get resultCache() { return this.state.resultCache ?? {}}

    private get result() {

        const cachedResult = this.resultCache[this.url as keyof object]
        if (cachedResult === undefined) {
            const resultPromise = fetch!(this.url)
                .then(resp => {
                    if (resp.ok) {
                        return resp.text() as Promise<any>
                    } else {
                        return resp.json().then((data: any) => this.handleError(data.error))
                    }
                })
                .catch(err => {
                    return this.handleError(err)
                })
                .then((data: any) => {
                    this.updateCalls(this.url, data)
                    return data
                })

            const result = pending(resultPromise)
            this.updateCalls(this.url, result)
            return result
        }

        return cachedResult
    }

    get value() {
        const {result} = this
        return isObject(result) ? result.valueOf() : result
    }

    valueOf() {
        return this.value
    }

    private updateCalls(key: string, data: any) {
        const newCache = mergeRight(this.resultCache, {[key]: data})
        this.state.resultCache = newCache
        this.updateState({resultCache: newCache})
    }

    private handleError = (error?: {message: string}) => {
        const errorMessage = error?.message ?? ''
        const description = this.url
        appFunctions.NotifyError(description, new Error(errorMessage))
        return new ErrorResult(description, errorMessage)
    }
}

WebFile.State = WebFileState
WebFile.Schema = WebFileSchema
WebFile.Metadata = WebFileMetadata
