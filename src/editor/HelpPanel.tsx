import {Box, Grid, IconButton, Stack, Typography} from '@mui/material'
import Close from '@mui/icons-material/Close'
import React from 'react'
import WhatIsElemento from '../docs/overview/WhatIsElemento'
import ElementoStudio from '../docs/overview/ElementoStudio'
import Controls from '../docs/overview/Controls'

export default function HelpPanel({onHelp}: { onHelp: () => void }) {
    return <Grid direction={'column'} container id="helpPanel" height='100%'>
        <Grid item xs='auto'>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
            >
                <Typography variant="h5" component='h1'>Help</Typography>
                <IconButton className='closeButton' onClick={onHelp}><Close/></IconButton>
            </Stack>
        </Grid>
        <Grid item xs  overflow='scroll'>
                <WhatIsElemento/>
                <ElementoStudio/>
                <Controls/>
        </Grid>
    </Grid>
}