import {Box, Grid} from '@mui/material'
import React from 'react'
import EditorRunner from '../editor/EditorRunner'
import FirstApp from './content/FirstApp'

export function TutorialRunner() {
    return (
        <Grid container columns={20} spacing={0} height='100%'>
            <Grid height='100%' overflow='scroll' size={5}>
                <Box padding={2}>
                    <FirstApp/>
                </Box>
            </Grid>
            <Grid height='100%' padding={1} borderLeft='2px solid gray' size={15}>
                <EditorRunner/>
            </Grid>
        </Grid>
    )
}
