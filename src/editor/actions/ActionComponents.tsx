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