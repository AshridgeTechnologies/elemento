import React from 'react'
import {Typography} from '@mui/material'
import {flatten} from 'ramda'

type Properties = {path: string, children?: any
    fontSize?: string | number, fontFamily?: string, color?: string, backgroundColor?: string,
    border?: number, borderColor?: string, width?: number, height?: number
    }

function asText(content: any) {
    if (React.isValidElement(content)) return content
    const contentValue = typeof content === 'object' && 'value' in content ? content.value : content
    if (typeof contentValue === 'string') {
        if (contentValue.includes('\n')) {
            return flatten(contentValue.split('\n').map((line: string, index: number) => [line, React.createElement('br', {key: index})]))
        }
        return contentValue

    }
    return contentValue
}

export default function TextElement({children, path, border, width, height, ...rest}: Properties) {
    return React.createElement(Typography, {id: path, gutterBottom: true,
        border: border, width, height, ...rest}, asText(children))
}
