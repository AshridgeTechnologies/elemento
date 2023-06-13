import React from 'react'
import {Box, Icon as MuiIcon, IconButton, Tooltip} from '@mui/material'

export function InfoButton(props: {description: string}) {
    return <Tooltip title={props.description} placement='top-end'>
        <IconButton>
            <MuiIcon aria-label='Help' sx={{color: 'action.active', mr: 1, my: 0.5}}>info_outlined</MuiIcon>
        </IconButton>
    </Tooltip>
}

export function InputWithInfo({description, width, formControl}:
                                  {
                                      description?: string,
                                      width?: string | number,
                                      formControl: React.ReactElement
                                  }) {
    return description
        ? <Box sx={{display: 'flex', alignItems: 'flex-start', width}}>
            {formControl}
            {InfoButton({description})}
        </Box>
        : formControl
}