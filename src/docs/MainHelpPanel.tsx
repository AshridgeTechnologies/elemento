import HelpPanel from './HelpPanel'
import WhatIsElemento from './overview/WhatIsElemento'
import ElementoStudio from './overview/ElementoStudio'
import Elements from './overview/Elements'
import Formulas from './overview/Formulas'
import ControlReference from './reference/ElementReference'
import FunctionReference from './reference/FunctionReference'
import React from 'react'
import GettingStarted from './overview/GettingStarted'
import DataTypes from './overview/DataTypes'
import Projects from './overview/Projects'
import WorkingWithProjects from './howTo/Working with Projects'
import Apps from './overview/Apps'

const MainHelpPanel = (props: { showTitleBar?: boolean }) =>
    <HelpPanel showTitleBar={props.showTitleBar}>
        <WhatIsElemento/>
        <ElementoStudio/>
        <GettingStarted/>
        <Projects/>
        <Apps/>
        <Elements/>
        <Formulas/>
        <DataTypes/>
        <WorkingWithProjects/>
        <ControlReference/>
        <FunctionReference/>
    </HelpPanel>
export default MainHelpPanel