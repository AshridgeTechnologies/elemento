import {createElement} from 'react'
import {valueLiteral} from '../runtimeFunctions'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import {clone} from 'radash'
import lodash from 'lodash';

const {isPlainObject} = lodash;

type Properties = {path: string, display?: boolean}
type StateProperties = {value: any}

export default function Data({path, display = false}: Properties) {
    const state = useGetObjectState<DataState>(path)
    return display ?  createElement('div', {id: path},
        createElement('div', null, path),
        createElement('code', null, valueLiteral(state.value))) : null
}

export class DataState extends BaseComponentState<StateProperties>
    implements ComponentState<DataState>{

    constructor(props: StateProperties, exposeProps = true) {
        super(props)
        if (exposeProps) this.exposeValueProperties()
    }

    protected withState(state: StateProperties) {
        const newVersion = new DataState(this.props, false)
        newVersion.state = state
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
        return this.state.value !== undefined ? this.state.value : this.props.value
    }

    valueOf() {
        return this.value
    }

    toString() {
        return this.value.toString()
    }

    updateFrom(newObj: DataState): this {
        return this.propsMatchValueEqual(this.props, newObj.props) ? this : new DataState(newObj.props).withState(this.state) as this
    }

    Set(value: any) {
        this.updateState({value})
    }

    Reset() {
        this.updateState({value: undefined})
    }

    Update(changes: object) {
        const newValue = clone(this.value)
        for (const p in changes) {
            newValue[p] = changes[p as keyof object]
        }
        this.updateState({value: newValue})
    }
}

Data.State = DataState
