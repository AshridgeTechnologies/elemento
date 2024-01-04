import {equals} from 'ramda'
import {Box, Button, Fab, IconButton, Typography} from '@mui/material'
import Mui_AppBar from '@mui/material/AppBar'

import {TreeItem, TreeView} from '@mui/x-tree-view'
import {ChevronRight, ExpandMore, NavigateBefore, NavigateNext} from '@mui/icons-material'
import React, {useEffect, useRef, useState} from 'react'
import Toolbar from '@mui/material/Toolbar'

type ContentsItem = { id: string, title: string, children?: ContentsItem[] }

const goBack = ()=> history.back()
const goForward = ()=> history.forward()

function HelpContents({items, selected, onSelected}: {items: ContentsItem[], selected: string | null, onSelected: (id: string) => void}) {
    const treeItem = ({id, title, children = []}: ContentsItem) =>
        <TreeItem nodeId={id} label={title} key={id} onClick={() => onSelected(id)} sx={{marginTop: '1rem', fontSize: '0.8rem'}}>
            {children.map(treeItem)}
        </TreeItem>

    return (<TreeView
        aria-label="help contents"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        selected={selected}
        sx={{ height: '100%', overflowY: 'auto' }}
    >
        {items.map(treeItem) }
    </TreeView>)
}

function HelpBar(props: {title: string}) {
    return (
        <Mui_AppBar position='relative'>
            <Toolbar variant="dense" sx={{minHeight: 40}}>
                <Typography variant="h6" component="div" sx={{fontSize: 16, flexGrow: 1}}>
                    {props.title}
                </Typography>
            </Toolbar>
        </Mui_AppBar>
    )
}

const NavButtons = () => <Box sx={{position: 'absolute', top: '10px', right: '30px'}}>
    <IconButton sx={{backgroundColor: 'lightGray'}} size='medium' aria-label='back' title='back' onClick={goBack}>
        <NavigateBefore sx={{fontSize: '2rem'}}/>
    </IconButton>
    <IconButton sx={{backgroundColor: 'lightGray', marginLeft: '5px'}} size='medium' aria-label='forward'
                title='forward' onClick={goForward}>
        <NavigateNext sx={{fontSize: '2rem'}}/>
    </IconButton>
</Box>

export function shouldShowTitleBar(): boolean {
    const headerParam = new URL(window.location.href).searchParams.get('header')
    return headerParam !== '0'
}

export default function HelpPanel({children, showTitleBar, title}: { children: React.ReactNode, showTitleBar?: boolean, title: string }) {


    const [helpItems, setHelpItems] = useState<ContentsItem[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const helpTextPanel = useRef<HTMLElement>(null)

    const syncSelectionToUrl = () => {
        const locationFromUrl = location.hash.substring(1)
        if (locationFromUrl != selectedId) {
            setSelectedId(locationFromUrl)
        }
    }

    useEffect(() => {
        window.addEventListener("popstate", syncSelectionToUrl)
    }, [])

    useEffect(() => {
        syncSelectionToUrl()
    })

    useEffect(()=> {
        if (selectedId && helpTextPanel.current) {
            helpTextPanel.current.querySelector(`#${selectedId}`)?.scrollIntoView({behavior: 'auto'})
        }
    })

    const findHelpItems = function (element: HTMLElement) {
        const sectionElements = Array.from(element.querySelectorAll('section'))
        const subSectionsOf = (el: HTMLElement): ContentsItem[] => Array.from(el.querySelectorAll('article')).map(el => ({
            id: el.id,
            title: el.querySelector('h2')?.textContent || '',
        }))
        return sectionElements.map(el => ({
            id: el.id,
            title: el.querySelector('h1')?.textContent || '',
            children: subSectionsOf(el)
        }))
    }

    useEffect( ()=> {
        const currentHelpItems = findHelpItems(helpTextPanel.current!)
        if (!equals(currentHelpItems, helpItems)) {
            setHelpItems(currentHelpItems)
        }
    })

    const onScroll = (event: any) => {
        //console.log('Scroll', event.currentTarget?.scrollTop)
    }

    const onSelected = (id: string) => {
        history.pushState(null, '', `#${id}`)
        syncSelectionToUrl()
    }


    const titleBar = (showTitleBar ?? shouldShowTitleBar()) ? <Box flex='0'>
        <HelpBar title={title}/>
    </Box> : null

    return <Box display='flex' flexDirection='column' id="helpPanel" height='100%'>
        {titleBar}
        <Box flex='1' minHeight={0}>
            <Box display='flex' flexDirection='row' height='100%' sx={{position: 'relative'}}>
                <NavButtons/>
                <Box flex='1' className='helpContent' minWidth='25ch' height='calc(100% - 1rem)' paddingTop='1rem'
                     sx={{backgroundColor: '#f8fafc', color: '#64748b'}}>
                    <HelpContents items={helpItems} selected={selectedId} onSelected={onSelected}/>
                </Box>
                <Box flex='4' className='helpText' ref={helpTextPanel} height='100%' padding='0 1rem' overflow='auto'
                     onScroll={onScroll} color='#334155'>
                    {children}
                </Box>
            </Box>
        </Box>
    </Box>
}