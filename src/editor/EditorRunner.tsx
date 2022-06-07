import ProjectHandler from './ProjectHandler'
import React, {useEffect, useState} from 'react'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {createTheme, ThemeProvider} from '@mui/material/styles'
import Editor from './Editor'
import {AppElementAction} from './Types'
import {Alert, AlertColor, AlertTitle, Link} from '@mui/material'
import {camelCase} from 'lodash'
import Project from '../model/Project'
import {loadJSONFromString} from '../model/loadJSON'

declare global {
    var getProject: () => Project
    var setProject: (project: string|Project) => void
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#0098a0',
        },
        secondary: {
            main: '#7e28ff',
        },
    },

    components: {
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontSize: '0.85rem',
                },
            },
        },
    }
})

export default function EditorRunner() {
    const [projectHandler] = useState<ProjectHandler>(new ProjectHandler())
    const [project, setProject] = useState<Project>(projectHandler.current)
    const [alertMessage, setAlertMessage] = useState<React.ReactNode | null>(null)

    const updateProject = () => setProject(projectHandler.current)

    useEffect( () => {
        window.setProject = (project: string|Project) => {
            const proj = typeof project === 'string' ? loadJSONFromString(project) : project
            projectHandler.setProject(proj)
            updateProject()
        }
        window.getProject = () => projectHandler.current
    })

    const onPropertyChange = (id: ElementId, propertyName: string, value: any)=> {
        projectHandler.setProperty(id, propertyName, value)
        updateProject()
    }

    const onInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType)=> {
        const newId = projectHandler.insertElement(insertPosition, targetElementId, elementType)
        updateProject()
        return newId
    }
    const onMove = (insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) => {
        projectHandler.move(insertPosition, targetElementId, movedElementIds)
        updateProject()
    }

    const onAction = (id: ElementId, action: AppElementAction) => {
        projectHandler.elementAction(id, action)
        updateProject()
    }


    const onOpen = async () => {
        try {
            await projectHandler.openFile()
            updateProject()
        } catch (e: any) {
            showAlert('Error opening project file', 'This file does not contain a valid Elemento project', `Error message: ${e.message}`, 'error')
        }
    }

    const onSave = async () => {
        await projectHandler.save()
        updateProject()
    }

    const onPublish = async ({name, code}: {name: string, code: string}) => {
        const publishName = camelCase(name) + '.js'
        const runUrl = await projectHandler.publish(publishName, code)
        updateProject()
        const runLink = <Link href={runUrl}>{runUrl}</Link>
        showAlert(`Published ${name}`, 'You can run the app with the link below', runLink, 'success')
    }

    const showAlert = (title: string, message: string, detail: React.ReactNode, severity: AlertColor) => {
        const removeAlert = () => setAlertMessage(null)
        setAlertMessage(<Alert severity={severity} onClose={removeAlert}>
            <AlertTitle>{title}</AlertTitle>
            <p id="alertMessage">{message}</p>
            <p>{detail}</p>
        </Alert>)
    }


    return <ThemeProvider theme={theme}>
            {alertMessage}
            <Editor project={project} onChange={onPropertyChange} onInsert={onInsert} onMove={onMove} onAction={onAction}
                onOpen={onOpen}
                onSave={onSave} onPublish={onPublish}/>
        </ThemeProvider>
}