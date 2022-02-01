import React from "react"
import {Typography} from '@mui/material'
import {NumberedList, Para, Heading, SubHeading, Section, SubSection} from '../HelpComponents'

export default () =>
    <Section helpId='controls'>
        <Heading>Controls</Heading>
        <Para>
            Controls are the things you see on the screen when your program runs,
            like boxes to input text, checkboxes to indicate yes or no, lists of items, buttons to make something happen - or just plain chunks of text.
            They are called "controls" because they are bit like the knobs, switches, lights or labels on the control panel of a machine.
        </Para>

        <SubSection helpId='adding-a-control'>
            <SubHeading>Adding a control to your program</SubHeading>
            <NumberedList>
                <li>Indicate where you want the new control to be by clicking on the name of an existing control in the Navigator.
                    The new control will be placed after the one you click on.</li>
                <li>Click the Insert button in the Menu Bar. A list of the available controls appears below it</li>
                <li>Click the name of the control you want to add.  It will show in the Navigator, selected as the current control.</li>
                <li>The properties of the new control will be shown in the Properties panel.  Set these up as you want them - see below.</li>
            </NumberedList>
            <Para>
                You will also see the new control immediately in the Running program.
            </Para>
        </SubSection>


        <SubSection helpId='control-properties'>
            <SubHeading>Properties</SubHeading>
            <Para>
                Every control has properties that affect how it looks and what it does.
                When you select a control in the Navigator by clicking on it, its properties appear in the Properties Panel.
            </Para>
            <Para>Each type of control has its own particular set of properties. Some properties, like Text Colour or
                Font Size, are found on many types of control,
                but other properties are unique to one type of control.
            </Para>
            <Para>
                You can set what you want each property to be by entering a formula in the box beside the name.  The formula can be either a fixed value or a calculation - see Formulas.
            </Para>

            <Para>
                You don't have to set up every property.  Some properties will have a default value that is already entered for you, or they can just be left empty.
                You will only set these properties in a few cases when you have a particular need. It's a bit like formatting a paragraph in a word processor:
                there are all sorts of styles and things you can tweak, but most of the time you only need to change one or two of them and leave the rest alone.
            </Para>
            <Para>The help section for each control type describes all the properties and what you can do with them.</Para>
            <Para>
                As you change property values, you can see the effect immediately in the Running program.  If you don't like what you see, just change it back or try something else.
            </Para>
        </SubSection>
    </Section>
