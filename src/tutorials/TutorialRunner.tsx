import {Box, Grid} from '@mui/material'
import React from 'react'
import EditorRunner from '../editor/EditorRunner'
import FirstApp from './content/FirstApp'

export function TutorialRunner() {
    return <Grid container columns={20} spacing={0} height='100%'>
        <Grid item xs={5} height='100%' overflow='scroll'>
            <Box padding={2}>
                <FirstApp/>
            </Box>
        </Grid>
        <Grid item xs={15} height='100%' padding={1} borderLeft='2px solid gray'>
            <EditorRunner/>
        </Grid>
    </Grid>
}
