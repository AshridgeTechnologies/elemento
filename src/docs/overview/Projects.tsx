import {
    BulletList,
    Heading,
    HelpLink,
    MinorHeading,
    NamedList,
    NLItem,
    Para,
    Section,
    SubHeading
} from '../HelpComponents'
import React from 'react'
import Link from '@mui/material/Link'

export default () =>
    <Section id='projects-overview'>
        <Heading>Projects</Heading>
        <Para>This section describes what Elemento Projects are, and the main parts they contain: Apps, ServerApps, Files, DataTypes and Tools</Para>

        <SubHeading>The Project</SubHeading>
        <Para>A Project is the main unit that you work on in the Elemento Studio. The Studio shows just one Project at a time,
            although you can open another one to replace it.
            You can also open the <HelpLink id='elemento-studio'>Studio</HelpLink> in more than one browser tab, and have a different Project open in each.</Para>
        <Para>There is an element at the top of the <HelpLink id='navigator'>Navigator</HelpLink> that represents the Project,
            and you can select it to change its Name and other properties, but you cannot delete it.</Para>
        <Para>Many simple Projects just contain one <HelpLink id='app'>App</HelpLink>, so it is difficult to see the difference between an App and a Project,
            but in a more advanced Project there may be multiple browser Apps, Server Apps and other parts that work together,
            so the Project element is needed to contain them all.</Para>

        <MinorHeading id='storing-project'>Storing a Project</MinorHeading>
        <Para>Elemento stores the information about a Project either in a convenient private store managed by your browser,
            or in a set of files in a folder you choose on your computer disk.
            You can copy this folder for backup, to share it with someone or to start another similar Project.</Para>
        <Para>When you are ready, a Project can also be uploaded into a code storage (or source control) system on the internet.
            Elemento includes facilities to work with the widely-used <Link href='https://github.com/'>GitHub</Link> system, but you can use others if you use their tools outside
            Elemento.</Para>
        <Para>Storing your Project in GitHub is completely optional, but it has many advantages, including:</Para>
        <BulletList>
            <li>The Project information is safely backed up</li>
            <li>It is the simplest way of publishing your App for others to use.
                Elemento provides a means for anyone to run an App directly from GitHub
            </li>
            <li>You can easily share the Project with others</li>
            <li>Multiple people can work on the Project, if you take care not to let changes clash with each other</li>
        </BulletList>

        <MinorHeading>Project Name and folder name</MinorHeading>
        <Para>Note that the Project Name does not need to be same as the name of the folder where it is stored,
            BUT you may want to keep them the same to avoid confusion.
        </Para>

        <MinorHeading>The parts of a Project</MinorHeading>
        <Para>At the top-level of a Project, there can be several types of element.
            Most simple Projects will have one App and possibly some Files for images. More advanced projects may use multiple Apps, together with
            Server Apps,
            Data Types and different types of File. Brief descriptions of these are given below, with links to more detail.
        </Para>
        <NamedList>
            <NLItem name='App'>An <HelpLink id='app'>App</HelpLink> is usually the most important element in a Project.
                It contains the Page(s) you see running in the browser and interact with.
            </NLItem>
            <NLItem name='File'>A <HelpLink id='file'>File</HelpLink> represents a disk file that is used by an App, for example an image file.
                It lives in the <em>Files</em> area under the Project
            </NLItem>
            <NLItem name='Data Type'>The <HelpLink id='dataType'>Data Type</HelpLink>s represent definitions of some data specific the Project, such
                as a Customer record.
                They are created in the Data Types area under the Project.
            </NLItem>
            <NLItem name='Server App'>A <HelpLink id='serverApp'>Server App</HelpLink>s is a type of app, used in more advanced Projects, that runs in
                a server in the cloud, not in the browser.
            </NLItem>
            <NLItem name='Tool'>A <HelpLink id='tool'>Tool</HelpLink>s is a special type of app, that is used to help you
                while <em>developing</em> the Project
                - it is not seen by the eventual user.
            </NLItem>
        </NamedList>

    </Section>
