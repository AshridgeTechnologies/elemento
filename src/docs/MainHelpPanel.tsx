import HelpPanel from './HelpPanel'
import WhatIsElemento from './overview/WhatIsElemento'
import ElementoStudio from './overview/ElementoStudio'
import Controls from './overview/Controls'
import Formulas from './overview/Formulas'
import ControlReference from './reference/ControlReference'
import FunctionReference from './reference/FunctionReference'
import React from 'react'

const MainHelpPanel = (props: { showTitleBar?: boolean }) =>
    <HelpPanel showTitleBar={props.showTitleBar}>
        <WhatIsElemento/>
        <ElementoStudio/>
        <Controls/>
        <Formulas/>
        <ControlReference/>
        <FunctionReference/>
    </HelpPanel>
export default MainHelpPanel