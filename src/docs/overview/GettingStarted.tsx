import React from 'react'
import {BulletList, Heading, HelpLink, Para, Section, SubHeading} from '../HelpComponents'
import Link from '@mui/material/Link'

export default () =>
    <Section id='getting-started'>
        <Heading>Getting Started with Elemento</Heading>

        <SubHeading>What you need</SubHeading>
        <BulletList>
            <li>A laptop or desktop computer with a good-size screen</li>
            <li>An up to date version of the Chrome browser</li>
            <li>An internet connection</li>
        </BulletList>

        <SubHeading>Learning</SubHeading>
        <Para>
            Elemento is designed to be as easy to use as possible,
            but it is a powerful tool that can be used to create a wide variety of software, so there is a a lot to find out.
            But it is also easy to get started with just a few basics, and learn more when you need it.
        </Para>
        <Para>This help guide tells you all you need to know, and if you already have some programming experience, it may be a quick way to get
            started.
            But if you are new to programming, a variety of guides, tutorials and example projects is coming
            to help you learn more easily at your own pace.</Para>
        <Para>To search in Help, click in the Help area, then press Control+F (Command+F on Mac) to use the browser search box.</Para>

        <SubHeading>Starting a new project</SubHeading>
        <BulletList>
            <li>In the Chrome browser, go to <Link href='https://elemento.online/studio'>the Elemento Studio</Link></li>
            <li>Click the <b>Create a new project</b></li>
            <li>In the box that appears, enter a name for the Project</li>
            <li>Click the Create button</li>
            <li>The main Studio page will show the new bare-bones Project, with just one page and a title</li>
        </BulletList>
        <Para>More information in <HelpLink id='working-with-projects'/></Para>

        <SubHeading>Quick start</SubHeading>
        <Para>Of course some people hate reading stuff and just want to get started. If that's you, just create a new project and explore.
            If you are used to learning by clicking around in menus you should pick it up quickly. You can always open up this Help to find out more.
        </Para>
        <Para>Here are a few pointers to get you going:</Para>
        <BulletList>
            <li>Select an element in the <HelpLink id='navigator'/> tree to see and set its properties</li>
            <li>Click the button at the left of a property to change it to a <HelpLink id='formulas'>formula</HelpLink></li>
            <li>Text in a formula needs to be in quotes - so you may see errors after changing until you edit the formula</li>
            <li>You build a formula using <HelpLink id='function-reference'>functions</HelpLink> and basic +, -, *, / operators</li>
            <li>Refer to another element in a formula by its Formula Name - without spaces</li>
            <li>Use the <HelpLink id='menu-reference'>Edit and Insert menus</HelpLink>  at the top,
                or the right-click menu on the Navigator, to add or manipulate elements</li>
            <li>To move elements, drag them in the Navigator, not the <HelpLink id='app-preview'>Preview</HelpLink></li>
        </BulletList>
        <Para>Enjoy exploring Elemento!</Para>
    </Section>
