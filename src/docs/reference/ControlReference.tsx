import React from 'react'
import {ControlSection, Heading, Para, PropertyEntry, Section, SubHeading, SubSection} from '../HelpComponents'
import {Link} from '@mui/material'

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

        <ControlSection name='Button' helpId='button'
            description='A Button control carries out an action when it is clicked.  You use an action formula to define what the button does.'
            properties={<>
                <PropertyEntry name='Content' type='text' helpId='button-content'>The text that is displayed in the
                    button.</PropertyEntry>
                <PropertyEntry name='Action' type='text' helpId='button-action'>The action formula that is run when the button is clicked.</PropertyEntry>
            </>
            }
        />

        <ControlSection name='Text' helpId='text'
            description='A Text control simply displays a section of text.  The Name is not shown.
                        You can set various properties to control how the text is displayed.'
            properties={<>
                <PropertyEntry name='Content' type='text' helpId='text-content'>The text that is displayed.</PropertyEntry>
                <PropertyEntry name='Font Size' type='number' helpId='text-fontSize'>The size of the text that is displayed, in pixels.</PropertyEntry>
                <PropertyEntry name='Font Family' type='number' helpId='text-fontSize'>The name of the typeface of the text that is displayed.
                    Knowing what names you can use is a big subject, but you could start with <Link href='https://blog.hubspot.com/website/web-safe-html-css-fonts' target='_blank'>this article</Link>.
                </PropertyEntry>
                <PropertyEntry name='color' type='text' helpId='text-color'>The color of the text displayed.
                        Most plain color names like 'green' will work, and you can find more in <Link href='https://www.w3schools.com/cssref/css_colors.asp' target='_blank'>this article</Link></PropertyEntry>
                <PropertyEntry name='backgroundColor' type='text' helpId='text-backgroundColor'>The color of the background of the text section.
                        See the <b>color</b> property for the color names you can use.</PropertyEntry>
                <PropertyEntry name='width' type='number' helpId='text-width'>The width of the text section displayed, in pixels.</PropertyEntry>
                <PropertyEntry name='height' type='number' helpId='text-height'>The height of the text section displayed, in pixels.</PropertyEntry>
                <PropertyEntry name='border' type='text' helpId='text-border'>The size of the border around the text section, in pixels.
                </PropertyEntry>
                <PropertyEntry name='borderColor' type='text' helpId='text-borderColor'>The color of the border around the text section.
                        See the <b>color</b> property for the color names you can use.</PropertyEntry>
            </>}
        />

        <ControlSection name='Text Input' helpId='textInput'
            description='A Text Input control is a box where the user can enter some text.
                        It can be given some pre-filled text which the user can change or replace.
                        It has a label that is shown in or near the control to tell the user what the text entered is for.'
            properties={<>
                <PropertyEntry name='Initial Value' type='text' helpId='textInput-initialValue'>The pre-filled text that is displayed when the control is first shown.</PropertyEntry>
                <PropertyEntry name='Max Length' type='number' helpId='textInput-maxLength'>The maximum length of the text that can be entered.</PropertyEntry>
                <PropertyEntry name='Multiline' type='true-false' helpId='textInput-multiline'>Whether text can be entered on multiple lines.</PropertyEntry>
                <PropertyEntry name='Label' type='text' helpId='textInput-label'>The descriptive label that is shown in or near the control.</PropertyEntry>
            </>}
        />

        <ControlSection name='Select Input' helpId='selectInput'
            description='A Select Input control presents a number of options that the user can choose.
                        It can be given a pre-filled value which the user can change.
                        It has a label that is shown in or near the control to tell the user what the choice is for.'
            properties={<>
                <PropertyEntry name='Options' type='list of string' helpId='selectInput-options'>The options that the user can choose from.</PropertyEntry>
                <PropertyEntry name='Initial Value' type='string' helpId='selectInput-initialValue'>
                        The pre-filled option that is displayed when the control is first shown.  Must be one of the items in the Options property.</PropertyEntry>
                <PropertyEntry name='Label' type='text' helpId='selectInput-label'>The descriptive label that is shown in or near the control.</PropertyEntry>
            </>}
        />

        <ControlSection name='Number Input' helpId='numberInput'
            description='A Number Input control is a box where the user can enter a number.
                        It can be given a pre-filled value which the user can change or replace.
                        It has a label that is shown in or near the control to tell the user what the number entered is for.'
            properties={<>
                <PropertyEntry name='Initial Value' type='number' helpId='numberInput-initialValue'>The pre-filled number that is displayed when the control is first shown.</PropertyEntry>
                <PropertyEntry name='Label' type='text' helpId='numberInput-label'>The descriptive label that is shown in or near the control.</PropertyEntry>
            </>}
        />

        <ControlSection name='True-False Input' helpId='trueFalseInput'
            description='A True-False Input control lets the user set something to either true or false (yes or no).
                        It can be given a pre-filled value which the user can change.
                        It has a label that is shown in or near the control to tell the user what the true-false setting is for.'
            properties={<>
                <PropertyEntry name='Initial Value' type='true-false' helpId='trueFalseInput-initialValue'>The pre-filled true-false value that is displayed when the control is first shown.</PropertyEntry>
                <PropertyEntry name='Label' type='text' helpId='trueFalseInput-label'>The descriptive label that is shown in or near the control.</PropertyEntry>
            </>}
        />

        <ControlSection name='Page' helpId='page'
            description='A Page control groups together a set of other controls that can be shown on the screen together.
                        A Page can only be inserted directly under the App.
                        To change the page shown on the screen, you use the Show() function.'
            properties={<>
            </>}
        />

        <ControlSection name='Data' helpId='data'
            description='A Data control holds data used by the app while it is running.  When the browser page is closed, the data is deleted.
                        It can be used like a notepad to hold data needed temporarily.  A Data control can hold a simple values, a record or a list.
                        You use the Set and Update functions to put data into a Data control and change it afterwards.
                        You can use the data in the control simply by using its name in a formula.
                        A data control would normally be kept hidden, with Display set to No, but you can set Display to Yes to
                        show the current data in order to understand more about what the program is doing.'
            properties={<>
                <PropertyEntry name='Initial Value' type='any' helpId='data-initialValue'>The pre-filled data in the control when the app starts running.</PropertyEntry>
                <PropertyEntry name='Display' type='true-false' helpId='data-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>

            </>}
        />

        <ControlSection name='Collection' helpId='collection'
            description='A Collection control holds a group of data items used by the app while it is running.
                        When the browser page is closed, the data is deleted.
                        It can be used like a set of pages in a notepad to hold data needed temporarily.  Each item in a Collection control can be a simple value, a record or a list.
                        Each item is associated with an id.  For a simple value, the id is the same as the value.
                        For a record with a property called "id" or "Id" the value of the property is used as the id.
                        For any other data item, a unique id is given when the item is added to the collection.
                        You use the Add and Update functions to put an item into a Collection control and change it afterwards.
                        You can use the Get function to look up an item by its id, or the GetAll function to get all the items.
                        The Remove function takes an item out of the collection
                        A Collection control would normally be kept hidden, with Display set to No, but you can set Display to Yes to
                        show the current data in order to understand more about what the program is doing.'
            properties={<>
                <PropertyEntry name='Initial Value' type='any' helpId='data-initialValue'>The pre-filled data in the control when the app starts running.</PropertyEntry>
                <PropertyEntry name='Display' type='true-false' helpId='data-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>

            </>}
        />
    </Section>

