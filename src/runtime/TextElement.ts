import React from 'react'

export function TextElement(props: {children: any}) {
    const {children} = props
    return React.createElement('p', null, children)
}
