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
            This is where you create your app. You can add elements to your app, and set up how they appear
            and what they do.
            It also continuously shows your app running, so you can instantly see the effect of any change you make.
        </Para>
        <Para>When you first go to the Elemento Studio, before you open a <HelpLink id='projects-overview'>Project</HelpLink>, you will see the Start page.
            This shows only the things you need to start a new Project or open an existing one.
            See <HelpLink id={'getting-started'}/> or <HelpLink id={'working-with-projects'}/> for more information.</Para>
        <Para>
            Once you have opened a Project, you will see the main Studio page. The main areas on the screen are:
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
                This lets you find your way around all the elements you have added to your app, move them around,
                and indicate where to add new ones.
                You may have seen something similar in a word processor if you use the contents panel to quickly see the
                headings in the document you are working on.
                You can open up and close different parts of it so you can see only the parts you need. Click on a
                element to select that element and see its properties.
            </Para>
            <Para>
                You can also right-click on an element to get an in-place menu of actions you can do to it or with it.
                This does not have to be the currently selected element.
            </Para>
        </SubSection>

        <SubSection id='properties-panel'>
            <SubHeading>Properties panel</SubHeading>
            <Para>
                Each element in your app has a number of properties - settings just for that element.
                When you click on a element in the Navigator, you see its properties in the Properties panel
                Every element has a Name property, but the others are different for every type of element.
                For example:
            </Para>
            <ul>
                <li>With a <HelpLink id='text'>Text</HelpLink> element you need to set where it gets the text from, and what font it uses
                    (among many other things)
                </li>
                <li>With a <HelpLink id='button'>Button</HelpLink>, you would need to set what happens when it is clicked</li>
            </ul>
        </SubSection>

        <SubSection id='app-preview'>
            <SubHeading>App Preview</SubHeading>
            <Para>
                This area shows you the app you are building, as you work on it. You can try out the app, and
                enter things into it, and then go back to make more changes.
                Every new element and change shows up in the App Preview immediately, and it will keep any data
                you have already entered if possible.
            </Para>
        </SubSection>

        <SubSection id='tools-window'>
            <SubHeading>Tools Window</SubHeading>
            <Para>
                This area shows Tools, including the built in Help that you are reading now.
                As it takes up a large area at the bottom of the screen, you can reduce it to a single line of buttons to select each Tool,
                and expand it again when you need it - click the up or down arrow at the upper right corner.
                You can close individual Tools by clicking the cross on the button. If all the Tools are closed, the Tools Window is not shown.
            </Para>
        </SubSection>

        <SubSection id='menu-reference'>
            <SubHeading>Menu Option Reference</SubHeading>

            <MinorHeading>File menu</MinorHeading>
            <Para>More details on using these options in <HelpLink id='working-with-projects'/></Para>
            <NamedList>
                <NLItem name='New'>Create a new Project</NLItem>
                <NLItem name='Open'>Open an existing project stored on this computer, either in the browser project store or on your disk</NLItem>
                <NLItem name='Save As'>Save a copy of an existing project to your computer disk</NLItem>
                <NLItem name='Get from GitHub'>Download (clone) a project from <HelpLink id='introduction-github'>GitHub</HelpLink></NLItem>
                <NLItem name='Update from GitHub'>Update a project previously downloaded to your computer from GitHub
                    with the latest changes</NLItem>
                <NLItem name='Save to GitHub'>
                    <Para>If the Project is not stored in GitHub yet, upload the initial version</Para>
                    <Para>If the Project is already in GitHub, update the copy there with the latest changes from your computer</Para>
                </NLItem>
            </NamedList>

            <MinorHeading>Edit menu</MinorHeading>
            <Para>Not all of these options will be shown, depending on the element you have selected.</Para>
            <Para>Undo and Redo are always shown, and they work pretty much the same way as in most other programs you use.
                You can also use Control-Z for Undo and Control-Shift-Z for Redo (Command-Z and Command-Shift-Z on Mac)
            </Para>
            <NamedList>
                <NLItem name='Delete'>Delete this element. You will be asked to confirm the deletion.</NLItem>
                <NLItem name='Copy'>Copy this element to the clipboard</NLItem>
                <NLItem name='Cut'>Copy this element to the clipboard and then delete it</NLItem>
                <NLItem name='Paste After'>Insert a new element after the one currently selected,
                    using the details of the last element copied to the clipboard</NLItem>
                <NLItem name='Paste Before'>Insert a new element before the one currently selected,
                    using the details of the last element copied to the clipboard</NLItem>
                <NLItem name='Paste Inside'>Insert a new element inside the one currently selected,
                    using the details of the last element copied to the clipboard</NLItem>
                <NLItem name='Duplicate'>Insert a new element after the one currently selected,
                    using the details of the currently selected element. Same effect as Copy followed by Paste After.</NLItem>
                <NLItem name='Undo'>
                    Put the project back to the state before the last change you made. You can do several Undos to go back multiple changes.
                </NLItem>
                <NLItem name='Redo'>
                    Undo the last Undo - so you go forward re-applying changes you made.
                </NLItem>
            </NamedList>

            <MinorHeading>Insert menu</MinorHeading>
            <Para>This is used for adding new elements to the project. It shows another box with two sections.</Para>

            <NamedList>
                <NLItem name='Insert position'>On the left, you select whether you want to add the element Before, After or Inside the currently
                    selected element.</NLItem>
                <NLItem name='Type of element'>On the right, you select the type of element you want to add.
                    The types shown are only those which can be added in the position you have selected.</NLItem>
            </NamedList>

            <MinorHeading>Help</MinorHeading>
            <Para>Shows the help you are reading now at the bottom of the Studio window.</Para>
        </SubSection>
    </Section>
