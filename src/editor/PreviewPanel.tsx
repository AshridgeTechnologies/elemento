import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {Stack, Typography} from '@mui/material'

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div style={{height: 'calc(100% - 50px)'}}
             role="tabpanel"
             hidden={value !== index}
             id={`simple-tabpanel-${index}`}
             aria-labelledby={`simple-tab-${index}`}
             {...other}
        >
            {(  // value === index &&
                <Box height='100%'>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function PreviewPanel(props: { preview: React.ReactNode, code: React.ReactNode, configName: string | null }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const message = props.configName ? <Typography padding='10px 4em'>Connected to {props.configName}</Typography> : ''
    return (
        <Box sx={{width: '100%', height: '100%', borderLeft: '2px solid gray'}}>
            <Stack direction="row" spacing={2} sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange} aria-label="preview options">
                    <Tab label="Preview" {...a11yProps(0)} />
                    <Tab label="Code" {...a11yProps(1)} />
                </Tabs>
                {message}
            </Stack>
            <TabPanel value={value} index={0}>
                {props.preview}
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Box paddingX={2} paddingY={1} data-testid='codeTab'>{props.code}</Box>
            </TabPanel>
        </Box>
    );
}
