import {equals} from 'ramda'
import {Box, IconButton, Stack, Typography} from '@mui/material'
import {TreeItem, TreeView} from '@mui/lab'
import Close from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import React, {useEffect, useRef, useState} from 'react'

type ContentsItem = { id: string, title: string, children?: ContentsItem[] }

function HelpContents({items, onSelected}: {items: ContentsItem[], onSelected: (id: string) => void}) {
    const treeItem = ({id, title, children = []}: ContentsItem) =>
        <TreeItem nodeId={id} label={title} key={id} onClick={() => onSelected(id)}>
            {children.map(treeItem)}
        </TreeItem>

    return (<TreeView
        aria-label="help contents"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ height: '100%', overflowY: 'auto' }}
    >
        {items.map(treeItem) }
    </TreeView>)
}

export default function HelpPanel({children, onClose}: { children: React.ReactNode, onClose: () => void }) {
    const [helpItems, setHelpItems] = useState<ContentsItem[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const helpTextPanel = useRef<HTMLElement>(null)
    useEffect(()=> {
        if (selectedId && helpTextPanel.current) {
            helpTextPanel.current.querySelector(`#${selectedId}`)?.scrollIntoView({behavior: 'smooth'})
        }
    })

    const findHelpItems = function (element: HTMLElement) {
        // console.log(element.querySelectorAll('section, article'))
        const sectionElements = Array.from(element.querySelectorAll('section'))
        const subSectionsOf = (el: HTMLElement): ContentsItem[] => Array.from(el.querySelectorAll('article')).map(el => ({
            id: el.id,
            title: el.querySelector('h5')?.textContent || '',
        }))
        const helpItems = sectionElements.map(el => ({
            id: el.id,
            title: el.querySelector('h4')?.textContent || '',
            children: subSectionsOf(el)
        }))
        // console.log(helpItems)
        return helpItems
    }

    useEffect( ()=> {
        const currentHelpItems = findHelpItems(helpTextPanel.current!)
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
                <IconButton className='closeButton' onClick={onClose}><Close/></IconButton>
            </Stack>
        </Box>
        <Box flex='0' className='helpContent'>
            <Box height={200} overflow='scroll'>
                <HelpContents items={helpItems} onSelected={(id) => {setSelectedId(id)} }/>
            </Box>
        </Box>
        <Box flex='1' minHeight={0} className='helpText'>
            <Box height='100%' overflow='scroll' ref={helpTextPanel}>
                {children}
            </Box>
        </Box>
    </Box>
}