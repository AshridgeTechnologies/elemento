import Tool from '../model/Tool'
import React from 'react'
import {Box} from '@mui/material'
import ToolImport from '../model/ToolImport'

export function ToolWindow({tool}: {
    tool: Tool | ToolImport,
}) {
    const toolUrl = tool instanceof ToolImport ? tool.source : `${location.origin}/studio/preview/tools/${tool.codeName}/`
    return <Box height='100%'>
        <iframe name={`tool_${tool.codeName}`} src={toolUrl} data-toolid={tool.id}
                style={{width: '100%', height: '100%', border: 'none', backgroundColor: 'white'}}/>
    </Box>
}