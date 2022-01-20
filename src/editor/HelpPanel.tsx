import {Box, IconButton, Stack, Typography} from '@mui/material'
import Close from '@mui/icons-material/Close'
import React, {useEffect, useRef, useState} from 'react'
import WhatIsElemento from '../docs/overview/WhatIsElemento'
import ElementoStudio from '../docs/overview/ElementoStudio'
import Controls from '../docs/overview/Controls'
import {helpElementId} from '../docs/HelpComponents'

export default function HelpPanel({onHelp}: { onHelp: () => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const helpTextPanel = useRef<HTMLElement>(null)
    useEffect(()=> {
        if (selectedId && helpTextPanel.current) {
            helpTextPanel.current.querySelector(`#${helpElementId(selectedId)}`)?.scrollIntoView({behavior: 'smooth'})
        }
    })
    
    return <Box display='flex' flexDirection='column' id="helpPanel" height='100%'>
        <Box flex='0'>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
            >
                <Typography variant="h5" component='h1'>Help</Typography>
                <IconButton className='closeButton' onClick={onHelp}><Close/></IconButton>
            </Stack>
        </Box>
        <Box flex='0' className='helpContent'>
            <div onClick={() => {setSelectedId('what-is-elemento')} }>What Is Elemento</div>
            <div onClick={() => {setSelectedId('elemento-studio')} }>Elemento Studio</div>
            <div onClick={() => {setSelectedId('controls')} }>Controls</div>
        </Box>
        <Box flex='1' minHeight={0} className='helpText'>
            <Box height='100%' overflow='scroll' ref={helpTextPanel}>
                <WhatIsElemento/>
                <ElementoStudio/>
                <Controls/>
            </Box>
        </Box>
    </Box>
}