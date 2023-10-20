import * as React from 'react';
import Box from '@mui/material/Box';
import {Link, Stack, Typography} from '@mui/material'

export default function PreviewPanel(props: { preview: React.ReactNode, configName: string | null, runUrl?: string }) {
    const message = props.configName ? <Typography padding='10px 4em'>Connected to {props.configName}</Typography> : ''
    const {runUrl} = props
    const runLink = props.runUrl ?
        <Typography padding='10px 4em'>Run from GitHub: <Link id='runLink' href={runUrl} target='publishedApp'>{runUrl}</Link>
        </Typography> : ''
    return (
        <Box sx={{width: '100%', height: '100%', borderLeft: '2px solid gray'}}>
            <Stack direction="row" spacing={2} sx={{borderBottom: 1, borderColor: 'divider'}}>
                {runLink}
                {message}
            </Stack>
            <Box sx={{
                backgroundColor: '#ddd',
                padding: '20px',
                height: 'calc(100% - 40px)'
            }}>
                {props.preview}
            </Box>
        </Box>
    )
}
