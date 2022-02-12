import React from "react"
import {ControlSection, Heading, Para, PropertyEntry, Section, SubHeading, SubSection} from '../HelpComponents'

export default () =>
    <Section helpId='controls-reference'>
        <Heading>Controls Reference</Heading>
        <Para>
            This section explains, for every type of control, what it does and how to use it.
        </Para>

        <SubSection helpId='about-properties'>
            <SubHeading>About Properties</SubHeading>
            <Para>The most important thing to know about a control is what properties it has.
                You set the properties using fixed values or formulas to make your program do what you want.
            </Para>
            <Para>
                Some properties are <b>required</b> - the control will not work unless you set them.  Properties may have a <b>default</b> value -
                a built-in value that is used if you don't set one.
            </Para>
            <Para>
                Some properties are found in every type of control:
            </Para>
            <Para>
                <b>Id</b><br/>
                A name given to the control by the Elemento editor when this control is added to the program.
                It cannot be changed, and it will be unique among the controls in the program.
            </Para>
            <Para>
                <b>Name</b><br/>
                The name of the control.  You may use this name in formulas to get the value of the control.
                In some cases the name is displayed on the page with the control.
            </Para>
        </SubSection>

        <ControlSection name='Button' helpId='Button'
                        description='A Button control carries out an action when it is clicked.  You use an action formula to define what the button does.'
            properties={<>
                <PropertyEntry name='Content' type='text' helpId='button-content'>The text that is displayed in the
                    button.</PropertyEntry>
                <PropertyEntry name='Action' type='text' helpId='button-action'>The action formula that is run when the button is clicked.</PropertyEntry>
                </>
            }
        />

        <ControlSection name='Text' helpId='Text'
                        description='A Text control simply displays a section of text.  The Name is not shown.'
            properties={
                    <PropertyEntry name='Content' type='text' helpId='text-content'>The text that is displayed.</PropertyEntry>
            }
        />

        <ControlSection name='Text Input' helpId='TextInput'
                        description='A Text Input control is a box where the user can enter some text.
                        It can be given some pre-filled text which the user can change or replace.
                        It has a label that is shown in or near the control to tell the user what the text entered is for.'
            properties={<>
                    <PropertyEntry name='Initial Value' type='text' helpId='textInput-initialValue'>The pre-filled text that is displayed when the control is first shown.</PropertyEntry>
                    <PropertyEntry name='Max Length' type='number' helpId='textInput-maxLength'>The maximum length of the text that can be entered.</PropertyEntry>
                    <PropertyEntry name='Label' type='number' helpId='textInput-label'>The descriptive label that is shown in or near the control.</PropertyEntry>
                </>}
        />
    </Section>

