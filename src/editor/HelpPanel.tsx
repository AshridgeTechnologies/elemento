import {equals} from 'ramda'
import {Box, IconButton, Typography} from '@mui/material'
import Mui_AppBar from '@mui/material/AppBar'

import {TreeItem, TreeView} from '@mui/lab'
import {ChevronRight, Close, ExpandMore} from '@mui/icons-material'
import React, {useEffect, useRef, useState} from 'react'
import Toolbar from '@mui/material/Toolbar'

type ContentsItem = { id: string, title: string, children?: ContentsItem[] }

function HelpContents({items, onSelected}: {items: ContentsItem[], onSelected: (id: string) => void}) {
    const treeItem = ({id, title, children = []}: ContentsItem) =>
        <TreeItem nodeId={id} label={title} key={id} onClick={() => onSelected(id)}>
            {children.map(treeItem)}
        </TreeItem>

    return (<TreeView
        aria-label="help contents"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        sx={{ height: '100%', overflowY: 'auto' }}
    >
        {items.map(treeItem) }
    </TreeView>)
}

function HelpBar({onClose}: {onClose: () => void}) {
    return (
        <Mui_AppBar position='relative'>
            <Toolbar variant="dense" sx={{minHeight: 40}}>
                <Typography variant="h6" component="div" sx={{fontSize: 16, flexGrow: 1}}>
                    Help
                </Typography>
                <IconButton className='closeButton' onClick={onClose} color='inherit'><Close/></IconButton>
            </Toolbar>
        </Mui_AppBar>
    )
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
        const sectionElements = Array.from(element.querySelectorAll('section'))
        const subSectionsOf = (el: HTMLElement): ContentsItem[] => Array.from(el.querySelectorAll('article')).map(el => ({
            id: el.id,
            title: el.querySelector('h5')?.textContent || '',
        }))
        return sectionElements.map(el => ({
            id: el.id,
            title: el.querySelector('h4')?.textContent || '',
            children: subSectionsOf(el)
        }))
    }

    useEffect( ()=> {
        const currentHelpItems = findHelpItems(helpTextPanel.current!)
        if (!equals(currentHelpItems, helpItems)) {
            setHelpItems(currentHelpItems)
        }
    })

    return <Box display='flex' flexDirection='column' id="helpPanel" height='100%'>
        <Box flex='0'>
            <HelpBar {...{onClose}}/>
        </Box>
        <Box flex='1' minHeight={0}>
            <Box display='flex' flexDirection='row' height='100%'>
                <Box flex='1' className='helpContent' minWidth='25ch' height='calc(100% - 1rem)'  paddingTop='1rem' sx={{backgroundColor: '#eee'}}>
                    <HelpContents items={helpItems} onSelected={(id) => setSelectedId(id)}/>
                </Box>
                <Box  flex='4' className='helpText' ref={helpTextPanel} height='100%'  padding='0 1rem' overflow='auto'>
                    {children}
                </Box>
            </Box>
        </Box>
    </Box>
}