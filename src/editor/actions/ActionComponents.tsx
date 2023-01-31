import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    TextFieldProps
} from '@mui/material'
import Close from '@mui/icons-material/Close'
import React from 'react'

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

export function EditorActionDialog({title, content, fields, action, onClose}:
                                 { title: string, content: React.ReactNode, fields: React.ReactNode, action: React.ReactNode, onClose: VoidFunction }) {
    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>{title} <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
                {fields}
            </DialogContent>
            <DialogActions>
                {action}
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )

}