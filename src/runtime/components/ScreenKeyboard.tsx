import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import React, {useEffect, useState} from 'react'
import {BaseComponentState} from '../state/BaseComponentState'

import * as SimpleKeyboard from 'react-simple-keyboard'
import css from './ScreenKeyboard_css'
import {sxProps} from './ComponentHelpers'
import Box from '@mui/material/Box'
import {useComponentState} from '../state/appStateHooks'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = {path: string, useRealKeyboard?: boolean, keyAction?: (key: string) => void, show?: PropVal<boolean>, styles?: StylesPropVals}
type ExternalStateProps = {}
type InternalStateProps = {value?: string}

const insertStyleElement = (id: string, css: string) => {
    if (css.length && !document.head.querySelector(`style#${id}`)) {
        const style = document.createElement('style')
        style.id = id
        style.textContent = css
        document.head.appendChild(style)
    }
}

const layout = {
    lettersOnly: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{ent} z x c v b n m {backspace}",
    ],

    // for future use
    default: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{shift} z x c v b n m {backspace}",
        "{numbers} {space} {ent}"
    ],
    shift: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{shift} Z X C V B N M {backspace}",
        "{numbers} {space} {ent}"
    ],
    numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"],
}
const display = {
    "{numbers}": "123",
    "{ent}": "Enter",
    "{escape}": "esc ⎋",
    "{tab}": "tab ⇥",
    "{backspace}": "⌫",
    "{capslock}": "caps lock ⇪",
    "{shift}": "⇧",
    "{controlleft}": "ctrl ⌃",
    "{controlright}": "ctrl ⌃",
    "{altleft}": "alt ⌥",
    "{altright}": "alt ⌥",
    "{metaleft}": "cmd ⌘",
    "{metaright}": "cmd ⌘",
    "{abc}": "ABC"
}

const translateKey = (key: string) => {
    switch (key){
        case '{ent}': return 'Enter'
        case '{backspace}': return 'Backspace'
        case '{tab}': return 'Tab'
        default: return key
    }
}

export const ScreenKeyboardSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Screenkeyboard",
    "description": "Description of ScreenKeyboard",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "ScreenKeyboard",
    "icon": "keyboard",
    "elementType": "statefulUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "keyAction": {
                    "description": "The ",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": [
                        "$key"
                    ]
                },
                "useRealKeyboard": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "show": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The ",
                    "$ref": "#/definitions/Styles"
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

export default function ScreenKeyboard({path, ...props}: Properties) {
    const {keyAction, useRealKeyboard, show = true, styles = {}} = valueOfProps(props)
    const [layoutName, setLayoutName] = useState("lettersOnly")
    const state = useComponentState(path, ScreenKeyboardState, {})
    useEffect(() => insertStyleElement('ScreenKeyboardCss', css), [])
    useEffect(() => {
        if (useRealKeyboard) {
            const handleKeydown = (event: KeyboardEvent) => onKeyPress(event.key)
            const page = document.querySelector('.ElPage') as HTMLElement
            page.addEventListener('keydown', handleKeydown)
            return () => page.removeEventListener('keydown', handleKeydown)
        }
    }, [])
    const onKeyPress = (key: string) => {
        if (key === "{shift}") {
            setLayoutName(layoutName === "default" ? "shift" : "default")
        } else if (key === "{abc}") {
            setLayoutName("default")
        } else if (key === "{numbers}") {
            setLayoutName("numbers")
        } else {
            state.handleKeypress(translateKey(key))
            keyAction?.(translateKey(key))
        }
    }

    if (useRealKeyboard && document.hasFocus()) {
        const page = document.querySelector('.ElPage') as HTMLElement
        const pageWithFocus = document.activeElement?.closest('.ElPage')
        if (pageWithFocus !== page) {
            document.getElementById(path)?.focus()
        }
    }

    const defaultStyles = {fontSize: '20px'}
    return <Box id={path} sx={sxProps({...defaultStyles, ...styles}, show)} tabIndex={-1}>
        <SimpleKeyboard.KeyboardReact
        layout={layout}
        display={display}
        mergeDisplay={true}
        layoutName={layoutName}
        onKeyPress={onKeyPress}
    /></Box>
}

export class ScreenKeyboardState extends BaseComponentState<ExternalStateProps, InternalStateProps>{

    get value() {
        return this.state.value ?? ''
    }

    valueOf() {
        return this.value
    }

    handleKeypress(key: string) {
        const updatedValue = (value: string, key: string) => {
            if (key === 'Backspace') {
                return value.slice(0, -1)
            } else if (key.length === 1) {
                return value + key
            } else {
                return value
            }
        }
        const value = updatedValue(this.value, key)
        this.updateState({value})

    }

    toString() { return String(this.value) }

    Reset() {
        this.updateState({value: undefined})
    }
}

ScreenKeyboard.State = ScreenKeyboardState
ScreenKeyboard.Schema = ScreenKeyboardSchema

