import React from 'react'
import {StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Dialog as MuiDialog, IconButton} from '@mui/material'
import {BaseComponentState, ComponentState} from './ComponentState'
import {BlockContent, BlockLayout} from './Block'
import Close from '@mui/icons-material/Close'
import {use$state} from '../state/appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

type Properties = { path: string, layout: BlockLayout, initiallyOpen?: boolean, showCloseButton?: boolean, styles?: StylesPropVals, children?: React.ReactElement[] }
type StateProperties = Partial<Readonly<{initiallyOpen: boolean}>>

type StateUpdatableProperties = Partial<Readonly<{ isOpen: boolean }>>

const DialogSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Dialog",
    "description": "A dialog box that can be opened and closed.  It can contain any elements, and can be given a title. ",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Dialog",
    "icon": "table_view",
    "elementType": "statefulUI",
    "canContain": "elementsWithThisParentType",
    "parentType": "Page",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "layout": {
                    "description": "The ",
                    "enum": ["vertical", "horizontal", "horizontal wrapped", "positioned", "none"]
                },
                "initiallyOpen": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "showCloseButton": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The ",
                    "$ref": "#/definitions/Styles"
                }
            }
        },
        "elements": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BaseElement"
            }
        }
    },
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const DialogMetadata: ElementMetadata = {
    stateProps: ['initiallyOpen']
}

const dialogSlotProps = {
    root: {
        sx: {position: 'absolute'},
    },
    backdrop: {
        sx: {
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
        }}

}

function CloseButton(props: { onClose: () => void }) {
    const iconButtonProps = {edge: 'start', color: 'inherit', onClick: props.onClose, 'aria-label': 'close', 'data-testid': 'dialog_close_button',
        sx:{position: 'absolute', right: 0, top: 0}}
    // @ts-ignore
    return React.createElement(IconButton, iconButtonProps,
        React.createElement(Close)
    )
}

export default function Dialog({children = [], path,  layout, initiallyOpen, showCloseButton, styles: styleProps = {}}: Properties) {
    const styles = valueOfProps(styleProps)
    const state = use$state(path, DialogState, {initiallyOpen})
    const handleClose = ()=> { state.Close() }
    return React.createElement(MuiDialog, {open: state.isOpen, onClose: handleClose, slotProps: dialogSlotProps},
        (showCloseButton ? React.createElement(CloseButton, {onClose: handleClose}) : null),
        React.createElement(BlockContent, {path, layout, styles}, children)
    )
}
export class DialogState extends BaseComponentState<StateProperties, StateUpdatableProperties>
    implements ComponentState<DialogState> {

    get isOpen() {
        return this.state.isOpen ?? this.props.initiallyOpen ?? false
    }

    Show() {
        if (!this.latest().isOpen) {
            this.updateState({isOpen: true})
        }
    }

    Close() {
        if (this.latest().isOpen) {
            this.updateState({isOpen: false})
        }
    }
}

Dialog.State = DialogState
Dialog.Schema = DialogSchema
Dialog.Metadata = DialogMetadata
