import React from 'react'
import {
    BulletList,
    Heading,
    HelpLink,
    MinorHeading,
    NamedList, NLItem,
    Para,
    Section,
    SubHeading,
    SubSection
} from '../HelpComponents'

export default () =>
    <Section id='elemento-studio'>
        <Heading>The Elemento Studio</Heading>
        <Para>
            This is where you create your app. You can add components to your app, and set up how they appear
            and what they do.
            It also continuously shows your app running, so you can instantly see the effect of any change you make.
        </Para>
        <Para>When you first go to the Elemento Studio, before you open a Project, you will see the Start page.
            This shows only the things you need to start a new Project or open an existing one.
            See <HelpLink id={'getting-started'}/> or <HelpLink id={'working-with-projects'}/> for more information.</Para>
        <Para>
            Once you have opened a Project, you will see the main Studio page.  The main areas on the screen are:
        </Para>
        <BulletList>
            <li>The menu bar (at the top)</li>
            <li>The Navigator (on the left)</li>
            <li>The Properties panel (in the centre)</li>
            <li>The running App Preview(on the right)</li>
            <li>The Tools window(at the bottom, if any Tools are shown)</li>
        </BulletList>
        <Para>
            Here is what you use each one for:
        </Para>

        <SubSection id='menu-bar'>
            <SubHeading>Menu bar</SubHeading>
            <Para>
                Click on the items in the menus to find the actions for everything you need to add and change things in
                your app.
                It works very much like the menu in a word processor or spreadsheet.
            </Para>
            <Para>The top-level menu items are:</Para>
            <NamedList>
                <NLItem name='File'>Options for creating and opening Projects - see <HelpLink id='working-with-projects'/></NLItem>
                <NLItem name='Edit'>Options for manipulating elements in the current Project - see <HelpLink id='working-with-elements'/></NLItem>
                <NLItem name='Insert'>Options for adding new elements to the current Project - see <HelpLink id='working-with-elements'/></NLItem>
                <NLItem name='Help'>Shows this Help in the <HelpLink id='tools-window'/></NLItem>
            </NamedList>
        </SubSection>

        <SubSection id='navigator'>
            <SubHeading>Navigator</SubHeading>
            <Para>
                This lets you find your way around all the components you have added to your app, move them around,
                and indicate where to add new ones.
                You may have seen something similar in a word processor if you use the contents panel to quickly see the
                headings in the document you are working on.
                You can open up and close different parts of it so you can see only the parts you need. Click on a
                component to select that component and see its properties.
            </Para>
        </SubSection>

        <SubSection id='properties-panel'>
            <SubHeading>Properties panel</SubHeading>
            <Para>
                Each component in your app has a number of properties - settings just for that component.
                When you click on a component in the Navigator, you see its properties in the Properties panel
                Every component has a Name property, but the others are different for every type of component.
                For example:
            </Para>
            <ul>
                <li>With a Text component you need to set where it gets the text from, and what font it uses
                    (among many other things)</li>
                <li>With a Button, you would need to set what happens when it is clicked</li>
            </ul>
        </SubSection>

        <SubSection id='running-program'>
            <SubHeading>App Preview</SubHeading>
            <Para>
                This area shows you the app you are building, as you work on it. You can try out the app, and
                enter things into it, and then go back to make more changes.
                Every new component and change shows up in the running app immediately, and it will keep any data
                you have already entered if possible.
            </Para>
        </SubSection>

        <SubSection id='tools-window'>
            <SubHeading>Tools Window</SubHeading>
            <Para>
                This area shows Tools, including the built in Help that you are reading now.
                As it takes up a large area at the bottom of the screen, you can reduce it to a single line of buttons to select each Tool,
                and expand it again when you need it - click the up or down arrow at the upper right corner.
                You can close individual Tools by clicking the cross on the button.  If all the Tools are closed, the Tools Window is not shown.
            </Para>
        </SubSection>
    </Section>
