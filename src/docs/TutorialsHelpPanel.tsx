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
import {BulletList, NamedList, NLItem, Para} from './HelpComponents'
import {Link} from '@mui/material'

const TutorialsIntro = () =>
    <div id='tutorials-intro' style={{paddingTop: '2rem', maxWidth: '50em'}}>
        <Para>
            Here are the official tutorials for Elemento.
        </Para>
        <Para>
            Click on the name to open a new tab with the Elemento Studio.  The tutorial will be in the lower half of the page.
        </Para>
    </div>

const TutorialsList = () =>
    <div id='tutorials-list' style={{paddingTop: '2rem', maxWidth: '50em', fontSize: 'larger'}}>
        <NamedList>
            <NLItem name={<Link href='/studio/?tool=/run/gh/ElementoResources/Getting-Started-Tutorial/tools/GettingStartedTutorial' target='elemento_tutorial'>Getting Started</Link>}>
                A quick tour of the Elemento Studio - including building your first app
            </NLItem>
            <NLItem name={<Link href='/studio/?tool=/run/gh/ElementoResources/Elements-Tutorial/tools/ElementsTutorial' target='elemento_tutorial'>Elements</Link>}>
                All about working with basic Elements
            </NLItem>
        </NamedList>
    </div>

const TutorialsHelpPanel = (props: { showTitleBar?: boolean }) =>
    <HelpPanel  title='Elemento Tutorials' showTitleBar={props.showTitleBar}>
        <TutorialsIntro/>
        <TutorialsList/>

    </HelpPanel>
export default TutorialsHelpPanel
