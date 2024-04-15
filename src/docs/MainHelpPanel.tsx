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
import DataStorage from './overview/DataStorage'
import {BulletList, Para} from './HelpComponents'
import {Link} from '@mui/material'

const MainIntro = () =>
    <div id='help-intro' style={{paddingTop: '2rem', maxWidth: '50em'}}>
        <Para>
            This page is a concise reference for Elemento.
            There are also:
        </Para>
        <BulletList>
            <li>a growing list tutorials in the <Link href='/help/tutorials'>Tutorials page</Link></li>
            <li>several longer guides in the <Link href='/help/guides' target='elemento_guides'>Guides page</Link></li>
        </BulletList>
    </div>

const MainHelpPanel = (props: { showTitleBar?: boolean }) =>
    <HelpPanel  title='Elemento Help' showTitleBar={props.showTitleBar}>
        <MainIntro/>
        <WhatIsElemento/>
        <GettingStarted/>
        <ElementoStudio/>
        <Projects/>
        <Apps/>
        <Elements/>
        <Formulas/>
        <DataTypes/>
        <DataStorage/>
        <WorkingWithProjects/>
        <ControlReference/>
        <FunctionReference/>
    </HelpPanel>
export default MainHelpPanel
