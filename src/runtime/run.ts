import {createRoot} from 'react-dom/client'
import React, {Attributes} from 'react'
import {DefaultAppContext} from './AppContext'

export const run = (elementType: React.FunctionComponent, containerElementId = 'main') => {
    const createContainer = () => {
        const container = document.createElement('div')
        container.id = containerElementId
        document.body.appendChild(container)
        return container
    }

    const container = document.getElementById(containerElementId) ?? createContainer()
    const root = createRoot(container)
    const appContext = new DefaultAppContext(null)
    root.render(React.createElement(elementType, {appContext} as Attributes))
}