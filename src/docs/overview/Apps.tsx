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

export default () =>
    <Section id='apps-overview'>
        <Heading>Apps</Heading>
        <Para>In Elemento, an App is a program that runs in the browser.
            It will display one or more Pages.</Para>
        <Para>Most <HelpLink id='projects-overview'>Projects</HelpLink> will just contain one App, but some advanced systems may have more than
            one.</Para>

        <SubHeading>Main parts of an App</SubHeading>
        <MinorHeading>Pages</MinorHeading>
        <Para>An App must contain at least one <HelpLink id='pages-overview'>Page</HelpLink>, or it will have nothing to display.
            A Page displays fixed text and data that can change, and accepts inputs from the user
        </Para>
        <Para>
            An App can have multiple Pages, and switch between them - only one Page can be displayed at a time,
            and it takes up most of the screen area of the App.
        </Para>

        <MinorHeading>App Bar</MinorHeading>
        <Para>An App Bar is a fixed element displayed above every Page in the App.
            It would normally be used to show things like menus and buttons to move between pages,
            or things that need to be available anywhere in the App, like a search box.
        </Para>


        <SubHeading>Background parts of an App</SubHeading>
        <Para>There are some elements that do not show on the screen, but are needed on every Page, so they are held directly under the App.</Para>

        <NamedList>
            <NLItem name='Collections'>A <HelpLink id='collection'>Collection</HelpLink> holds data that can be used in any Page.
            </NLItem>
            <NLItem name='Data Stores'>Collections can be connected to a Data Store to hold the data permanently. See
                <BulletList>
                    <li><HelpLink id='fileDataStore'>File Data Store</HelpLink></li>
                    <li><HelpLink id='firestoreDataStore'>Firestore Data Store</HelpLink></li>
                    <li><HelpLink id='browserDataStore'>Browser Data Store</HelpLink></li>
                    <li><HelpLink id='fileDataStore'>File Data Store</HelpLink></li>
                </BulletList>
            </NLItem>
            <NLItem name='Functions'>A <HelpLink id='function'>Function</HelpLink> under an App can be used in any Page.
                If you need to do the same thing in several Pages, consider creating a Function under the App rather than copying the formula in each
                Page.
            </NLItem>
            <NLItem name='Server App Connector'>A <HelpLink id='serverAppConnector'>Server App Connector</HelpLink> is
                an advanced feature that allows any Page in the App to access a Server App.
            </NLItem>
        </NamedList>

    </Section>