import {createRoot} from 'react-dom/client'
import React from 'react'

export const run = (elementType: React.FunctionComponent, containerElementId = 'main') => {
    const createContainer = () => {
        const container = document.createElement('div')
        container.id = containerElementId
        document.body.appendChild(container)
        return container
    }

    const container = document.getElementById(containerElementId) ?? createContainer()
    const root = createRoot(container)
    root.render(React.createElement(elementType))
}