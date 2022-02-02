import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

export default function MenuBar({children = [] }: {children?: React.ReactNode}) {
    return (
        <Box sx={{flexGrow: 1}}>
            <Toolbar variant="dense" sx={{borderBottom: '1px solid #ddd'}}>
                {children}
            </Toolbar>
        </Box>
    );
}