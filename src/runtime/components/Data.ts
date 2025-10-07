import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {BaseComponentState, ComponentState, WithChildStates} from './ComponentState2'
import {clone} from 'radash'
import lodash from 'lodash'
import {shallow} from 'zustand/shallow'
import {equals, omit} from 'ramda'
import {use$state} from '../state/appStateHooks'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

const {isPlainObject} = lodash

type Properties = {path: string, initialValue: any, display?: boolean}
type StateExternalProperties = {initialValue: any}
type StateInternalProperties = {value: any}

const DataSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Data",
    "description": "Description of Data",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Data",
    "icon": "note",
    "elementType": "statefulUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "initialValue": {
                    "description": "The ",
                    "$ref": "#/definitions/Expression"
                },
                "display": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression",
                    "default": false
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

export const DataMetadata = {
    stateProps: ['initialValue']
}

export default function Data({path, initialValue, display = false}: Properties) {
    const state = use$state(path, DataState, {initialValue})
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(state.value))) : null
}

export class DataState extends BaseComponentState<StateExternalProperties, StateInternalProperties>
    implements ComponentState<DataState>{

    constructor(props: StateExternalProperties, exposeProps = true) {
        super(props)
        if (exposeProps) this.exposeValueProperties()
    }

    private updateValue(value: any) {
        this.state.value = value
        this.updateState({value})
    }

    public withState(state: WithChildStates<StateInternalProperties>) {
        const newVersion = new DataState(this.props, false)
        newVersion.state = {...state}
        newVersion.exposeValueProperties()
        return newVersion as this
    }

    private exposeValueProperties() {
        const {value} = this
        if (!isPlainObject(value)) return
        const propNames = Object.getOwnPropertyNames(this.value)
        propNames.forEach( prop => Object.defineProperty(this, prop, {value: this.value[prop], configurable: true}))
    }

    get value() {
        return this.state.value !== undefined ? this.state.value : this.props.initialValue
    }

    valueOf() {
        return this.value
    }

    toString() {
        return this.value.toString()
    }

    Set(value: any) {
        this.updateValue(value)
    }

    Reset() {
        this.updateValue(undefined)
    }

    Update(changes: object) {
        const newValue = clone(this.value)
        for (const p in changes) {
            newValue[p] = changes[p as keyof object]
        }
        this.updateValue(newValue)
    }
}

Data.State = DataState
Data.Schema = DataSchema
Data.Metadata = DataMetadata
