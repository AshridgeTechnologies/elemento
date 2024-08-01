import React from 'react'
import {StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Box, Dialog as MuiDialog, IconButton} from '@mui/material'
import {BaseComponentState, ComponentState} from './ComponentState'
import {useGetObjectState} from '../appData'
import {BlockContent, BlockLayout} from './Block'
import {Close} from '@mui/icons-material'

type Properties = { path: string, layout: BlockLayout, showCloseButton?: boolean, styles?: StylesPropVals, children?: React.ReactElement[] }
type StateProperties = Partial<Readonly<{initiallyOpen: boolean}>>

type StateUpdatableProperties = Partial<Readonly<{ isOpen: boolean }>>

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

export default function Dialog({children = [], path,  layout, showCloseButton, styles: styleProps = {}}: Properties) {
    const styles = valueOfProps(styleProps)
    const state = useGetObjectState<DialogState>(path)
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
            this.latest().updateState({isOpen: true})
        }
    }

    Close() {
        if (this.latest().isOpen) {
            this.latest().updateState({isOpen: false})
        }
    }
}

(Dialog as any).State = DialogState
