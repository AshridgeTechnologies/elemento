import React, {ChangeEvent, useState} from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@mui/material'
import {CloseButton} from './actions/ActionComponents'

export function CommitDialog({onCommit, onClose}: {
    onCommit: (commitMessage: string) => Promise<void>,
    onClose: VoidFunction
}) {
    const [commitMessage, setCommitMessage] = useState<string>('')
    const onChangeCommitMessage = (event: ChangeEvent) => setCommitMessage((event.target as HTMLInputElement).value)
    const canCommit = !!commitMessage

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Save to GitHub <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a description of the changes made
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="commitMessage"
                    label="Changes made"
                    fullWidth
                    variant="standard"
                    value={commitMessage}
                    onChange={onChangeCommitMessage}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={() => onCommit(commitMessage)} disabled={!canCommit}>Save</Button>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}