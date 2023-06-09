import React from 'react'
import {Box, Icon as MuiIcon, IconButton, Tooltip} from '@mui/material'

export function InputWithInfo({description, width, formControl}:
                                  {
                                      description?: string,
                                      width?: string | number,
                                      formControl: React.FunctionComponentElement<any>
                                  }) {
    return description
        ? <Box sx={{display: 'flex', alignItems: 'flex-start', width}}>
            {formControl}
            <Tooltip title={description} placement='top-end'>
                <IconButton>
                    <MuiIcon aria-label='Help' sx={{color: 'action.active', mr: 1, my: 0.5}}>info_outlined</MuiIcon>
                </IconButton>
            </Tooltip>
        </Box>
        : formControl
}