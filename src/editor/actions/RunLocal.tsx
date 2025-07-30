import React, {useState} from 'react'
import {List, ListItemButton, ListItemText} from '@mui/material'
import {EditorActionDialog} from './ActionComponents'
import {doAction, internalProjectsDir, loadAppNames, UIManager} from './actionHelpers'

import {RunAppFn} from '../Types'

type ProjectApp = [project: string, app: string, dirHandle: FileSystemDirectoryHandle]

const loadProjectNames = async (dir: FileSystemDirectoryHandle) => {
    const result: ProjectApp[] = []
    // @ts-ignore
    for await (const [project, dirHandle] of dir.entries()) {
        const appNames = await loadAppNames(dirHandle)
        appNames.forEach( app => result.push([project, app, dir]) )
    }
    return result
}

export function RunLocalDialog({openProjectFn, uiManager}: { openProjectFn: RunAppFn, uiManager: UIManager }) {
    const [names, setNames] = useState<ProjectApp[]>([])
    const [namesLoaded, setNamesLoaded] = useState(false)

    if (!namesLoaded) {
        internalProjectsDir().then( loadProjectNames ).then( setNames ).then( () => setNamesLoaded(true))
    }
    const title = 'Run app on your computer'
    return <EditorActionDialog
        onCancel={uiManager.onClose} title={title}
        content='Choose an app stored in the browser'
        fields={<>
            <List dense sx={{maxHeight: 300, overflowY: 'auto', mt: 2, mb: 2}}>
                {names.map( ([project, app, dir]: ProjectApp) => (
                    <ListItemButton key={project+app}
                                    onClick={doAction(uiManager, title, async () => openProjectFn('opfs', project, app, dir))}>
                        <ListItemText primary={`${project}/${app}`}/>
                    </ListItemButton>
                ))}
            </List>
        </>}
        action={null}
    />
}
