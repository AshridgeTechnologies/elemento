import React from 'react'
import {SxProps, TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import {pick} from 'ramda'
import {formControlStyles, inputElementProps, propsForInputComponent, sxFieldSetProps, sxProps} from './ComponentHelpers'


type Properties = Readonly<{path: string, label?: PropVal<string>, show?: PropVal<boolean>, styles?: StylesPropVals}>
type StateInputProperties = Partial<Readonly<{period: PropVal<number>, interval: PropVal<number>, intervalAction: (t: TimerState) => void, endAction: (t: TimerState) => void}>>
type StateInternalProperties = Partial<Readonly<{startTime: Date, intervalCount: number, stoppedTime: Date, finishedTime: Date, previousElapsedMillis: number}>>

const stateReset = {startTime: undefined, intervalCount: undefined, stoppedTime: undefined, finishedTime: undefined, previousElapsedMillis: undefined}

export default function Timer({path, ...props}: Properties) {
    const {label, show = false, styles = {}} = valueOfProps(props)
    const sx = {...sxProps(pick(formControlStyles, styles), show), fieldset: sxFieldSetProps(styles)} as SxProps<{}>

    const state = useGetObjectState<TimerState>(path)
    const optionalProps = definedPropertiesOf({label})
    const inputComponentProps = propsForInputComponent(undefined, styles)
    const inputProps = inputElementProps(styles, false, {})

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value: state.elapsedTime?.toFixed(2) ?? '',
        InputLabelProps: {shrink: true},
        sx,
        ...inputProps,
        ...inputComponentProps,
        ...optionalProps
    })
}

export class TimerState extends BaseComponentState<StateInputProperties, StateInternalProperties>
    implements ComponentState<TimerState> {
    get period() { return valueOf(this.props.period) ?? null }
    get interval() { return valueOf(this.props.interval) ?? null }
    get intervalAction() { return this.props.intervalAction ?? null }
    get endAction() { return this.props.endAction ?? null }
    get isStarted() { return this.startTime !== null && !this.isFinished }
    get isRunning() { return this.isStarted && !this.state.stoppedTime }
    get isFinished() {return Boolean(this.period && this.startTime && this.elapsedTime! >= this.period)}
    get value() { return this.elapsedTime }
    get startTime() { return this.state.startTime ?? null }

    get intervalTime() { return this.interval ? this.intervalCount * this.interval : null }
    get elapsedTime() {
        if (!this.startTime) {
            return 0
        }

        const totalElapsedTime = this.totalElapsedMillis / 1000
        return this.period ? Math.min(this.period, totalElapsedTime) : totalElapsedTime
    }
    get remainingTime() {
        if (!this.period) {
            return null
        }
        if (this.isFinished) {
            return 0
        }
        return Math.max(this.period - this.elapsedTime, 0)
    }
    get intervalCount() { return this.state.intervalCount ?? 0 }
    get finishedTime() { return this.state.finishedTime ?? null }
    private get totalElapsedMillis() {
        const previousElapsedMillis = this.state.previousElapsedMillis ?? 0
        const currentElapsedMillis = (this.state.stoppedTime?.getTime() ?? Date.now()) - (this.startTime?.getTime() ?? 0)
        return previousElapsedMillis + currentElapsedMillis}

    Start() {
        if (this.latest().isRunning) return

        if (this.state.stoppedTime) {
            this.updateState({startTime: new Date(), stoppedTime: undefined, previousElapsedMillis: this.totalElapsedMillis})
        } else {
            this.updateState({...stateReset, startTime: new Date()})
        }
        requestAnimationFrame(() => this.latest().checkIntervals())
    }

    Stop() {
        if (!this.latest().isRunning) return
        this.updateState({stoppedTime: new Date()})
    }

    Reset() {
        this.updateState(stateReset)

    }

    valueOf() {
        return this.value
    }

    toString() {
        return this.value.toString()
    }

    private checkIntervals() {
        if (this.isRunning) {
            if( this.interval) {
                const currentIntervalCount = Math.floor(this.totalElapsedMillis / (this.interval * 1000))
                if (currentIntervalCount > this.intervalCount) {
                    this.updateState({intervalCount: currentIntervalCount})
                    this.latest().intervalAction?.(this.latest())
                }
            } else {
                this.updateState({intervalCount: this.intervalCount + 1})
                this.latest().intervalAction?.(this.latest())
            }

            requestAnimationFrame(() => this.latest().checkIntervals())
        }

        if (this.isFinished) {
            this.updateState({finishedTime: new Date()})
            this.endAction?.(this.latest())
        }
    }
}

Timer.State = TimerState
