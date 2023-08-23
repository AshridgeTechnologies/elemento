import React, {ChangeEvent, useState} from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@mui/material'
import {CloseButton} from './actions/ActionComponents'

export function CreateGitHubRepoDialog({onCreate, onClose, defaultName}: {
    onCreate: (repoName: string) => Promise<void>,
    onClose: VoidFunction,
    defaultName: string
}) {
    const [repoName, setRepoName] = useState<string>(defaultName)
    const onChangeRepoName = (event: ChangeEvent) => setRepoName((event.target as HTMLInputElement).value)
    const canCreate = !!repoName

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Create GitHub repository <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for the new repository
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="repositoryName"
                    label="Repository name"
                    fullWidth
                    variant="standard"
                    value={repoName}
                    onChange={onChangeRepoName}
                />
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={() => onCreate(repoName)} disabled={!canCreate}>Create</Button>
                <Button variant='outlined' onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}