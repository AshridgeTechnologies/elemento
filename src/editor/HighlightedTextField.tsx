import {TextField, TextFieldProps} from '@mui/material'
import React, {useEffect, useRef} from 'react'
import {mergeDeepRight} from 'ramda'
import {noop} from '../util/helpers'

//from html-escaper but with &apos
const esca = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&apos;'}
const escape = (es: string) => es.replace(/[&<>"]/g, (m: string) => esca[m as keyof typeof esca])

export function HighlightedTextField(props: TextFieldProps & { readOnly?: boolean, highlightRegex?: RegExp }) {
    const {multiline, readOnly,
        highlightRegex, slotProps = {}, onKeyDown = noop, sx, ...other} = props
    const onTextFieldKeyDown = (event: React.KeyboardEvent) => {
        if (!multiline && event.key === 'Enter') {
            event.preventDefault()
        }
        onKeyDown(event as any)
    }

    const inputRef = useRef<HTMLDivElement>(null)
    const highlightDivRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const input = inputRef.current
        const highlight = highlightDivRef.current
        if (input && highlight) {
            const text = (other.value ?? '') as string
            const highlightMarkup = highlightRegex ? escape(text).replace(highlightRegex, '<span style="background-color: yellow">$&</span>') : text
            const {height, width} = input.getBoundingClientRect()
            const {lineHeight, letterSpacing, fontFamily, fontSize} = getComputedStyle(input)
            highlight.style.height = height + 'px'
            highlight.style.width = width + 'px'
            highlight.style.top = input.offsetTop + 'px'
            highlight.style.left = input.offsetLeft + 'px'
            highlight.style.lineHeight = lineHeight
            highlight.style.letterSpacing = letterSpacing
            highlight.style.fontFamily = fontFamily
            highlight.style.fontSize = fontSize
            highlight.innerHTML = highlightMarkup
        }
    })

    return <div className={'wrapper'} style={{flexGrow: 1, position: 'relative'}}>
        <div ref={highlightDivRef} style={{color: 'transparent', position: 'absolute', whiteSpace: 'pre-wrap'}}></div>
        <TextField variant='filled' size='small' sx={{width: '100%', ...sx}}
                   multiline={true}
                   slotProps={mergeDeepRight(slotProps, {
                       input: {readOnly},
                       htmlInput: {ref: inputRef}
                   })}
                   onKeyDown={onTextFieldKeyDown}
                   {...other}
        />
    </div>
}
