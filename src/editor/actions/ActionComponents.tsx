import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    TextFieldProps
} from '@mui/material'
import Close from '@mui/icons-material/Close'
import React from 'react'
import {userCancelledFilePick} from './actionHelpers'

export function CloseButton(props: { onClose: () => void }) {
    return <IconButton
        aria-label="close"
        onClick={props.onClose}
        sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
        }}
    >
        <Close/>
    </IconButton>
}

export function DialogTextField(props: TextFieldProps) {
    return <TextField
        margin="dense"
        fullWidth
        variant="standard"
        error={!!props.helperText}
        {...props}
    />
}

export function EditorActionDialog({title, content, fields, action, onCancel}:
                                 { title: string, content: React.ReactNode, fields: React.ReactNode, action: React.ReactNode, onCancel: VoidFunction }) {
    return (
        <Dialog onClose={onCancel} open={true}>
            <DialogTitle>{title} <CloseButton onClose={onCancel}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
                {fields}
            </DialogContent>
            <DialogActions>
                {action}
                <Button variant='outlined' onClick={onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )

}

export function DirectoryInput(props: {
    id: string,
    label: string,
    value: FileSystemDirectoryHandle | null,
    onChange: (dir: FileSystemDirectoryHandle) => void,
    helperText: string | null
}) {

    const chooseDir = () => {
        window.showDirectoryPicker({id: 'elemento_editor', mode: 'readwrite'}).then(props.onChange)
            .catch(e => {
                if (userCancelledFilePick(e)) {
                    return null
                }
                throw e
            })

    }

    const inputProps = {
        readOnly: true,
        endAdornment:
            <InputAdornment position="end">
                <Button aria-label="choose folder" onClick={chooseDir}>Choose</Button>
            </InputAdornment>
    }
    return <Stack direction='row'>
        <TextField
            id={props.id} label={props.label}
            margin="dense"
            fullWidth
            variant="standard"
            value={props.value?.name ?? ''}
            error={!!props.helperText}
            helperText={props.helperText}
            InputProps={inputProps}
        />
    </Stack>
}