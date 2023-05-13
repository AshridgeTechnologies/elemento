import Element from './Element'
import {ComponentType, PropertyValueType} from './Types'
import BaseElement, {propDef} from './BaseElement'

export type Properties = {
    readonly language?: PropertyValueType<string>,
    readonly expectedPhrases?: PropertyValueType<string[]>,
}

export default class SpeechInput extends BaseElement<Properties> implements Element {

    static kind = 'SpeechInput'
    static get iconClass() { return 'keyboard_voice_outlined' }

    type(): ComponentType { return 'statefulUI' }
    get language() { return this.properties.language }
    get expectedPhrases() { return this.properties.expectedPhrases }

    get propertyDefs() {
        return [
            propDef('language', 'string', {state: true}),
            propDef('expectedPhrases', 'string list', {state: true}),
        ]
    }
}
