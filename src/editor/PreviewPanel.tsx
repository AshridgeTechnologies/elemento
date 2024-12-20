import * as React from 'react'
import Box from '@mui/material/Box'
import {Link, Stack, Typography} from '@mui/material'

export default function PreviewPanel(props: { preview: React.ReactNode, runUrl?: string, height: string }) {
    const {runUrl, height} = props
    const runLink = props.runUrl ?
        <Typography padding='10px 4em'>Run from GitHub: <Link id='runLink' href={runUrl} target='publishedApp'>{runUrl}</Link>
        </Typography> : ''
    return (
        <Box sx={{width: '100%', height, borderLeft: '2px solid gray'}}>
            <Stack direction="row" spacing={2} sx={{borderBottom: 1, borderColor: 'divider'}}>
                {runLink}
            </Stack>
            <Box sx={{
                backgroundColor: '#ddd',
                padding: '10px',
                height: 'calc(100% - 21px)'
            }}>
                {props.preview}
            </Box>
        </Box>
    )
}
