import {createElement} from 'react'
import {BaseComponentState} from './ComponentState'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

const SpeechRecognition  = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition
const SpeechGrammarList = (globalThis as any).SpeechGrammarList || (globalThis as any).webkitSpeechGrammarList

type Properties = {path: string}
type ExternalProperties = {language?: string, expectedPhrases?: string[]}
type StateProperties = {speechRecognition: any, recording: boolean, value: string, confidence: number | null}

type RecognitionStatus = 'ready' | 'started' | 'stopping' | 'stopping_startRequested'
type SpeechRecognitionExt = typeof SpeechRecognition
    & {onaudiostart: any, onaudioend: any, onstart: any, onend: any, onsoundstart: any, onsoundend: any, onspeechstart: any, onspeechend: any, status: RecognitionStatus}

type SpeechRecognitionEvent = any
type SpeechRecognitionErrorEvent = any

export const SpeechInputSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Speechinput",
    "description": "Description of SpeechInput",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "SpeechInput",
    "icon": "keyboard_voice_outlined",
    "elementType": "statefulUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "language": {
                    "description": "The ",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "expectedPhrases": {
                    "description": "The ",
                    "$ref": "#/definitions/StringListOrExpression"
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

export const SpeechInputMetadata = {
    stateProps: ['language', 'expectedPhrases']
}

export default function SpeechInput({path}: Properties) {
    return createElement('div', {id: path})
}

export class SpeechInputState extends BaseComponentState<ExternalProperties, StateProperties> {

    static defaultValue = ''

    get value() {
        return this.state.value ?? SpeechInputState.defaultValue
    }

    get recording() {
        return this.state.recording
    }

    get confidence() {
        return this.state.confidence || null
    }

    valueOf() {
        return this.value
    }

    private get speechRecognition() {
        return this.state.speechRecognition ??= this.newSpeechRecognition()
    }

    private newSpeechRecognition() {
        const recognition = new SpeechRecognition() as SpeechRecognitionExt
        recognition.interimResults = false
        recognition.maxAlternatives = 3

        const logEvent = (event: SpeechRecognitionEvent) => console.log('SpeechRecognition', event.type, recognition.status)
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const firstResult = event.results[0][0]
            console.log('SpeechRecognition', '- Result:', firstResult)
            this.updateState({value: firstResult.transcript, confidence: firstResult.confidence})
        }
        recognition.onnomatch = logEvent

        recognition.onspeechend = (event: SpeechRecognitionEvent) => {
            logEvent(event)
            recognition.stop()
            // this.updateState({recording: false})
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition', 'error', event.error)
            recognition.abort()
            this.updateState({recording: false, value: undefined, confidence: null})
        }

        recognition.onaudiostart = logEvent
        recognition.onaudioend = logEvent
        recognition.onend = (e: any) => {
            logEvent(e)
            if (recognition.status === 'stopping_startRequested') {
                this.doStart()
            } else {
                recognition.status = 'ready'
            }
        }
        recognition.onsoundstart = logEvent
        recognition.onsoundend = logEvent
        recognition.onspeechstart = logEvent
        recognition.onstart = logEvent
        recognition.status = 'ready'
        return recognition
    }

    Start() {
        const recognition = this.speechRecognition
        if (recognition.status === 'started' || recognition.status === 'stopping_startRequested') {
            return
        }
        if (recognition.status === 'stopping') {
            recognition.status = 'stopping_startRequested'
            return
        }
        this.doStart()
    }

    Stop() {
        this.requestStop()
        this.updateState({recording: false})
    }

    Reset() {
        this.requestStop()
        this.updateState({value: undefined, recording: false, confidence: null})
    }

    private requestStop() {
        const recognition = this.speechRecognition
        if (recognition.status === 'started') {
            recognition.stop()
            recognition.status = 'stopping'
        }
    }

    private doStart() {
        const recognition = this.speechRecognition
        if (this.props.expectedPhrases) {
            const grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + this.props.expectedPhrases.join(' | ') + ';'
            const speechRecognitionList = new SpeechGrammarList()
            speechRecognitionList.addFromString(grammar, 1)
            recognition.grammars = speechRecognitionList
        }
        recognition.lang = this.props.language
        recognition.start()
        recognition.status = 'started'
        this.updateState({value: undefined, recording: true, confidence: null})
    }
}

SpeechInput.State = SpeechInputState
SpeechInput.Schema = SpeechInputSchema
SpeechInput.Metadata = SpeechInputMetadata
