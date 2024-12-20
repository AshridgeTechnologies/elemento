import {createElement} from 'react'
import {BaseComponentState, ComponentState} from './ComponentState'

const SpeechRecognition  = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition
const SpeechGrammarList = globalThis.SpeechGrammarList || globalThis.webkitSpeechGrammarList

type Properties = {path: string}
type ExternalProperties = {language?: string, expectedPhrases?: string[]}
type StateProperties = {speechRecognition: any, recording: boolean, value: string, confidence: number | null}

type RecognitionStatus = 'ready' | 'started' | 'stopping' | 'stopping_startRequested'
type SpeechRecognitionExt = SpeechRecognition
    & {onaudiostart: any, onaudioend: any, onstart: any, onend: any, onsoundstart: any, onsoundend: any, onspeechstart: any, onspeechend: any, status: RecognitionStatus}

export default function SpeechInput({path}: Properties) {
    return createElement('div', {id: path})
}

export class SpeechInputState extends BaseComponentState<ExternalProperties, StateProperties>
    implements ComponentState<SpeechInputState>{

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
