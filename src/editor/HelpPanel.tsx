import {equals} from 'ramda'
import {Box, IconButton, Stack, Typography} from '@mui/material'
import {TreeView, TreeItem} from '@mui/lab'
import Close from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import React, {useEffect, useRef, useState} from 'react'
import WhatIsElemento from '../docs/overview/WhatIsElemento'
import ElementoStudio from '../docs/overview/ElementoStudio'
import Controls from '../docs/overview/Controls'

type ContentsItems = { id: string, title: string }[]

function HelpContents({items, onSelected}: {items: ContentsItems, onSelected: (id: string) => void}) {
    return <TreeView
        aria-label="help contents"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ height: '100%', overflowY: 'auto' }}
    >
        {items.map( ({id, title}) =>  <TreeItem nodeId={id} label={title} onClick={() => {onSelected(id)} }/>) }

    </TreeView>
}

export default function HelpPanel({onHelp}: { onHelp: () => void }) {
    const [helpItems, setHelpItems] = useState<ContentsItems>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const helpTextPanel = useRef<HTMLElement>(null)
    useEffect(()=> {
        if (selectedId && helpTextPanel.current) {
            helpTextPanel.current.querySelector(`#${selectedId}`)?.scrollIntoView({behavior: 'smooth'})
        }
    })

    useEffect( ()=> {
        console.log(helpTextPanel.current!.querySelectorAll('section, article'))
        const sectionElements = Array.from(helpTextPanel.current!.querySelectorAll('section'))
        const currentHelpItems = sectionElements.map( el => ({id: el.id, title: el.querySelector('h4')?.textContent || ''}) )
        console.log(currentHelpItems)
        if (!equals(currentHelpItems, helpItems)) {
            setHelpItems(currentHelpItems)
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
            <HelpContents items={helpItems} onSelected={(id) => {setSelectedId(id)} }/>
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