import React, {ChangeEvent} from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material'
import {CloseButton} from './actions/ActionComponents'

export function UploadDialog({onClose, onUploaded}: {
    onClose: () => void,
    onUploaded: (name: string, data: Uint8Array) => void
}) {
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {target} = event
        const {files} = target
        const file1 = files?.[0]
        if (file1) {
            onUpload(file1).then(onClose)
        } else {
            onClose()
        }
    }

    const onBlur = (event: ChangeEvent<HTMLInputElement>) => {
        const {target} = event
        const {files} = target
        console.log('blur', files)
    }

    const onUpload = async (file: File | undefined) => {
        if (file) {
            const dataBuffer = await file.arrayBuffer()
            const data = new Uint8Array(dataBuffer)
            onUploaded(file.name, data)
        }
    }

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>Upload file <CloseButton onClose={onClose}/></DialogTitle>
            <DialogContent>
                <input
                    style={{display: 'none'}}
                    id="uploadFileInput"
                    type="file"
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </DialogContent>
            <DialogActions>
                <label htmlFor="uploadFileInput">
                    <Button variant="contained" component="span">Choose File</Button>
                </label>
                <Button variant='outlined' onClick={onClose} sx={{ml: 1}}>Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}
