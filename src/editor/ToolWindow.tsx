import Tool from '../model/Tool'
import {VoidFn} from './Types'
import React, {useEffect, useRef} from 'react'
import EditorController from './EditorController'
import {editorElement} from './EditorElement'
import PreviewController from './PreviewController'
import {Stack, Typography} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import {CancelOutlined} from '@mui/icons-material'

export function ToolWindow({tool, previewFrame, onClose}: {
    tool: Tool,
    previewFrame: HTMLIFrameElement | null,
    onClose: VoidFn
}) {
    const name = tool.name
    const toolUrl = `${location.origin}/studio/preview/tools/${tool.codeName}/`
    const toolFrameRef = useRef<HTMLIFrameElement>(null)
    useEffect(() => {
        const contentWindow = toolFrameRef.current?.contentWindow
        if (contentWindow) {
            // @ts-ignore
            (contentWindow as Window).Editor = new EditorController(editorElement())
            const previewWindow = previewFrame?.contentWindow
            if (previewWindow) {
                // @ts-ignore
                (contentWindow as Window).Preview = new PreviewController(previewWindow)
            } else {
                console.error('Preview frame not ready')
            }
        } else {
            console.error('Tool content window not present')
        }
    }, [])
    return <Stack height='100%'>
        <Stack direction='row' spacing={1}
               sx={{paddingLeft: '1.5em', height: '2em', color: 'white', backgroundColor: 'secondary.main'}}>
            <Typography sx={{marginTop: '0.3em'}}>{name}</Typography>
            <IconButton edge="start" color="inherit" aria-label="close" sx={{ml: 2}}
                        onClick={onClose}><CancelOutlined/></IconButton>
        </Stack>
        <iframe name='toolFrame' src={toolUrl} ref={toolFrameRef}
                style={{width: '100%', height: '100%', border: 'none', backgroundColor: 'white'}}/>
    </Stack>
}