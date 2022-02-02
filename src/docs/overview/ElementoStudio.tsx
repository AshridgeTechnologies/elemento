import React from "react"
import {BulletList, Heading, Para, Section, SubHeading, SubSection} from '../HelpComponents'

export default () =>
    <Section helpId='elemento-studio'>
        <Heading>The Elemento Studio</Heading>
        <Para>
            This is where you create your program. You can add components to your program, and set up how they appear
            and what they do.
            It also continuously shows your program running, so you can instantly see the effect of any change you make.
        </Para>
        <Para>
            The main areas on the screen are:
        </Para>
        <BulletList>
            <li>The menu bar (at the top)</li>
            <li>The navigation tree (on the left)</li>
            <li>The properties panel (on the right)</li>
            <li>The running program (in the centre)</li>
        </BulletList>
        <Para>
            Here is what you use each one for:
        </Para>

        <SubSection helpId='menu-bar'>
            <SubHeading>Menu bar</SubHeading>
            <Para>
                Click on the items in the menus to find the actions for everything you need to add and change things in
                your program.
                It works very much like the menu in a word processor or spreadsheet.
            </Para>
        </SubSection>

        <SubSection helpId='navigator'>
            <SubHeading>Navigator</SubHeading>
            <Para>
                This lets you find your way around all the components you have added to your program, move them around,
                and indicate where to add new ones.
                You may have seen something similar in a word processor if you use the contents panel to quickly see the
                headings in the document you are working on.
                You can open up and close different parts of it so you can see only the parts you need. Click on a
                component to select that component and see its properties.
            </Para>
        </SubSection>

        <SubSection helpId='properties-panel'>
            <SubHeading>Properties panel</SubHeading>
            <Para>
                Each component in your program has a number of properties - settings just for that component.
                When you click on a component in the Navigation tree, you see its properties in the Properties panel
                Every component has a name property, but the others are different for every type of component.
                For example with a Text component you need to set where it gets the text from, and what font it uses
                (among many other things).
                With a Button, you would need to set what happens when it is clicked.
            </Para>
        </SubSection>

        <SubSection helpId='running-program'>
            <SubHeading>Running program</SubHeading>
            <Para>
                This area shows you the program you are building, as you work on it. You can try out the program, and
                enter things into it, and then go back to make more changes.
                Every new component and change shows up in the running program immediately, and it will keep any data
                you have already entered if possible.
            </Para>
        </SubSection>
    </Section>
