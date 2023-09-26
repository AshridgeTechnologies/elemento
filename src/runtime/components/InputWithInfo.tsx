import React from 'react'
import {Box, Icon as MuiIcon, IconButton, Tooltip} from '@mui/material'

export function RequiredButton() {
    return <Tooltip title={'Required'} placement='top-end'>
        <IconButton className='requiredButton' sx={{px: 0.15}}>
            <MuiIcon aria-label='Required' sx={{fontSize: '0.6em', color: '#d73c3c', mr: 0, mt: 0.5}}>emergency</MuiIcon>
        </IconButton>
    </Tooltip>
}

export function InfoButton(props: {description: string}) {
    return <Tooltip title={props.description} placement='top-end'>
        <IconButton sx={{px: 0.15}}>
            <MuiIcon aria-label='Help' sx={{fontSize: '0.8em', color: 'action.active', ml: 0.5, mr: 1, mt: 0.25}}>info_outlined</MuiIcon>
        </IconButton>
    </Tooltip>
}

export function InputWithInfo({description, required, width, formControl}:
                                  {
                                      description?: string,
                                      required?: boolean,
                                      width?: string | number,
                                      formControl: React.ReactElement
                                  }) {
    return description || required
        ? <Box sx={{display: 'flex', alignItems: 'flex-start', width}}>
            {formControl}
            {required ? RequiredButton() : null}
            {description ? InfoButton({description}) : null}
        </Box>
        : formControl
}