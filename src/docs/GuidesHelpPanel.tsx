import HelpPanel from './HelpPanel'
import React from 'react'
import DataTypes from './overview/DataTypes'
import {Para} from './HelpComponents'
import ServerApps from './guides/ServerApps'
import Link from '@mui/material/Link'

const GuidesIntro = () =>
    <div id='guides-intro' style={{paddingTop: '2rem', maxWidth: '50em'}}>
        <Para>
            This page contains several longer guides which explain various areas of Elemento in detail.
            It should be used together with the <Link href='/help'>main Help page</Link>, which is a more concise reference.
        </Para>
    </div>

const GuidesHelpPanel = (props: { showTitleBar?: boolean }) =>
    <HelpPanel title='Elemento Guides' showTitleBar={props.showTitleBar}>
        <GuidesIntro/>
        <DataTypes/>
        <ServerApps/>
    </HelpPanel>
export default GuidesHelpPanel
