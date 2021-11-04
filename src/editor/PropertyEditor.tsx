import React from 'react'
import Element from '../model/Element'
import Text from '../model/Text'
import {Box, TextField} from '@mui/material'
import {OnChangeFn} from './Types'
import Page from '../model/Page'

export default function PropertyEditor(props: {element: Element, onChange: OnChangeFn }) {
    const {element, onChange} = props
    const handleChange = (propertyName: string) => (event: any) => {
        const newValue = event.target.value
        onChange(element.id, propertyName, newValue)
    }

    let children = null

    if (Page.is(element)) {
        children = <>
            <TextField id="name" label="Name" variant="outlined" value={element.name}
                       onChange={handleChange('name')}/>
            <TextField id="style" label="Style" variant="outlined" value={element.style || ''}
                       onChange={handleChange('style')}/>
        </>
    }

    if (Text.is(element)) {
        children = <>
            <TextField id="name" label="Name" variant="outlined" value={element.name}
                       onChange={handleChange('name')}/>
            <TextField id="content" label="Content" variant="outlined" value={element.contentExpr}
                       onChange={handleChange('contentExpr')}/>
        </>
    }

    if (children) {
        return <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <TextField id="id" label="Id" variant="outlined" value={element.id} disabled/>
            {children}
        </Box>
    }

    return <div>Unknown element type {element.constructor.name}</div>
}