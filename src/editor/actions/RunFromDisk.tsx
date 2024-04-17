import React, {useState} from 'react'
import {Button, List, ListItemButton, ListItemText} from '@mui/material'
import {EditorActionDialog} from './ActionComponents'
import {chooseDirectory, doAction, loadAppNames, UIManager, validateDirectoryForOpen} from './actionHelpers'
import {ASSET_DIR} from '../../shared/constants'
import {RunAppFn} from '../runLocalApp'

type ProjectApp = [project: string, app: string]

export function RunFromDiskDialog({openProjectFn, uiManager}: { openProjectFn: RunAppFn, uiManager: UIManager }) {

    const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null)
    const [names, setNames] = useState<ProjectApp[]>([])
    const [namesLoaded, setNamesLoaded] = useState(false)

    const openProjectFromDisk = async () => {
        const dirHandle = await chooseDirectory()
        if (dirHandle) {
            const error = await validateDirectoryForOpen(dirHandle)
            if (error) {
                uiManager.showAlert('Run app', error, null, 'error')
            } else {
                setDirHandle(dirHandle)
                setNames([])
                setNamesLoaded(false)
            }
        }
    }

    if (!dirHandle) {
        openProjectFromDisk()
        return null
    }

    if (!namesLoaded) {
        loadAppNames(dirHandle).then((names) => {
            if (names.length === 1) {
                openProjectFn('disk', dirHandle.name, names[0], dirHandle)
            } else {
                const projectApps = names.map( appName => [dirHandle.name, appName] as ProjectApp)
                setNames(projectApps)
                setNamesLoaded(true)
            }
        } )
    }

    const title = 'Run app on your computer'
    if (!(dirHandle && namesLoaded)) {
        return null
    }
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content={`Choose an app stored in folder ${dirHandle.name}:`}
        fields={<>
            <List dense sx={{maxHeight: 300, overflowY: 'auto', mt: 2, mb: 2}}>
                {names.map( ([project, app]: ProjectApp) => (
                    <ListItemButton key={project+app}
                                    onClick={doAction(uiManager, title, async () => openProjectFn('disk', project, app, dirHandle) )}>
                        <ListItemText primary={`${project}/${app}`}/>
                    </ListItemButton>
                ))}
            </List>
        </>}
        action={<Button variant='outlined' onClick={openProjectFromDisk}>Choose Another Folder</Button>}
    />
}
