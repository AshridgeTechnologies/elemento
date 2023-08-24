import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Tool from '../model/Tool'
import ToolImport from '../model/ToolImport'
import {ToolWindow} from './ToolWindow'
import {IconButton} from '@mui/material'
import {Close, KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material'

interface TabProps {
    tool: Tool | ToolImport
    onCloseTool: (toolId: string) => void
}

interface TabPanelProps {
    children?: React.ReactNode
    toolId: string
    selectedToolId: string,
    shown: boolean
}

function a11yProps(tabName: string) {
    return {
        id: `tooltab-${tabName}`,
        'aria-controls': `tooltabpanel-${tabName}`,
    }
}

function ToolTabPanel({ children, shown, selectedToolId, toolId, ...other }: TabPanelProps) {
    const display: boolean = shown && selectedToolId === toolId
    return (
        <div
            role="tabpanel"
            hidden={selectedToolId !== toolId}
            id={`tooltabpanel-${toolId}`}
            aria-labelledby={`tooltab-${toolId}`}
            style={{height: '100%'}}
            {...other}
        >
            {(
                <Box sx={{ height: '100%', display: display ? 'inherit' : 'none'}}>
                    {children}
                </Box>
            )}
        </div>
    )
}

const ToolLabel = ({tool, onCloseTool}: TabProps) => {
    const toolId = tool.codeName
    const onClick = (event: React.SyntheticEvent) => {
        event.stopPropagation()
        onCloseTool(toolId)
    }
    return <span>
            {tool.name}
            <IconButton sx={{paddingTop: '4px', paddingLeft: '12px'}} onClick={onClick}>
                <Close sx={{fontSize: '1rem'}}/>
            </IconButton>
        </span>
}

export default function ToolTabsPanel({tools, selectedTool, toolsShown, onSelectTool, onCloseTool, onShowTools}:
                                            {tools: (Tool | ToolImport)[],
                                            selectedTool: string, toolsShown: boolean,
                                            onSelectTool: (toolId: string) => void,
                                            onCloseTool: (toolId: string) => void,
                                            onShowTools: (show: boolean) => void}) {
    const handleChange = (event: React.SyntheticEvent, newValue: string) => onSelectTool(newValue)
    const handleHideShow = () => {
        const newShown = !toolsShown
        onShowTools(newShown)
        console.log('Show', newShown)
    }
    const ensureToolsShown = () => onShowTools(true)
    const someToolsAreOpen = tools.length > 0
    return (
        <Box sx={{ width: '100%', height: '100%' }} data-testid='tooltabspanel' display='flex' flexDirection='column'>
            <Box sx={{ borderBottom: 1, borderTop: 1, borderColor: 'divider' }} display={someToolsAreOpen ? 'flex' : 'none'} flexDirection='row' flexGrow={0}>
                <Tabs value={selectedTool} onChange={handleChange} aria-label="tool tabs" sx={{flex: 1}}>
                    {tools.map( tool => <Tab component='div' value={tool.codeName}
                                             onClick={ensureToolsShown}
                                             label={<ToolLabel tool={tool} onCloseTool={onCloseTool}/>} {...a11yProps(tool.codeName)} key={tool.codeName} /> )}
                </Tabs>
                <IconButton
                    size="large"
                    aria-label="show or hide tools"
                    aria-expanded={someToolsAreOpen ? 'true' : undefined}
                    onClick={handleHideShow}
                    color="inherit"
                >
                    {toolsShown ? <KeyboardArrowDown /> : <KeyboardArrowUp /> }
                </IconButton>
            </Box>
            <Box  flexGrow={1} >
                {tools.map( (tool) => (
                    <ToolTabPanel shown={toolsShown} selectedToolId={selectedTool} toolId={tool.codeName} key={tool.codeName}>
                        <ToolWindow tool={tool}/>
                    </ToolTabPanel>
                    ))
                }
            </Box>
        </Box>
    )
}