import HelpPanel from './HelpPanel'
import WhatIsElemento from '../docs/overview/WhatIsElemento'
import ElementoStudio from '../docs/overview/ElementoStudio'
import Controls from '../docs/overview/Controls'
import Formulas from '../docs/overview/Formulas'
import ControlReference from '../docs/reference/ControlReference'
import FunctionReference from '../docs/reference/FunctionReference'
import React from 'react'

const EditorHelpPanel = (props: {onClose: () => void}) =>
    <HelpPanel onClose={props.onClose}>
        <WhatIsElemento/>
        <ElementoStudio/>
        <Controls/>
        <Formulas/>
        <ControlReference/>
        <FunctionReference/>
    </HelpPanel>

export default EditorHelpPanel