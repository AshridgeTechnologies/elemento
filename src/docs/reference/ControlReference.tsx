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
                You set the properties using fixed values or formulas to make your app do what you want.
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
                A name given to the control by the Elemento editor when this control is added to the app.
                It cannot be changed, and it will be unique among the controls in the app.
            </Para>
            <Para>
                <b>Name</b><br/>
                The name of the control.  You may use this name in formulas to get the value of the control.
                In some cases the name is displayed on the page with the control.
            </Para>
        </SubSection>

        <ControlSection name='App' helpId='app'
            description='The top-level of a app that contains other controls.
            It contains the Pages displayed by the app, and it may contain an AppBar shown for every Page.
            It can also contain background controls like Data Stores and Collections.  These can be accessed anywhere in the app.'
            properties={<>
                <PropertyEntry name='Content' type='text' helpId='app-maxWidth'>The maximum width in pixels that this App will display.
                    If empty, the App will take up as much room as is available</PropertyEntry>
                <PropertyEntry name='Author' type='text' helpId='app-author'>Intended to hold the name of the developer of this App.</PropertyEntry>
            </>
            }
        />

        <ControlSection name='AppBar' helpId='appBar'
            description='A bar shown at the top of the App above every Page.  It can be given a title to display, and it can also contain other controls. '
            properties={<>
                <PropertyEntry name='Title' type='text' helpId='appBar-title'>The title displayed at the left, before any other controls in the app bar.</PropertyEntry>
            </>
            }
        />

        <ControlSection name='Button' helpId='button'
            description='A Button control carries out an action when it is clicked.  You use an action formula to define what the button does.'
            properties={<>
                <PropertyEntry name='Content' type='text' helpId='button-content'>The text that is displayed in the
                    button.</PropertyEntry>
                <PropertyEntry name='Action' type='action-formula' helpId='button-action'>The action formula that is run when the button is clicked.</PropertyEntry>
                <PropertyEntry name='Filled' type='true-false' helpId='button-filled'>If Yes, this button is shown in solid colour, with text in a contrasting colour.
                    <strong>Note:</strong> A button in an App Bar will not show up properly unless it is filled.</PropertyEntry>
                <PropertyEntry name='Display' type='true-false' helpId='button-display'>Whether the button is shown on the screen.
                    Can be used with a Formula to show the control only under certain conditions.</PropertyEntry>

            </>
            }
        />

        <ControlSection name='Collection' helpId='collection'
                        description='A Collection control holds a group of data items used by the app while it is running.
                        When the browser page is closed, the data is deleted, unless the Collection is attached to a Data Store (see below).
                        It can be used like a set of pages in a notepad to hold data needed temporarily.  Each item in a Collection control can be a simple value, a record or a list.
                        Each item is associated with an id.  For a simple value, the id is the same as the value.
                        For a record with a property called "id" (lower case) the value of the property is used as the id.
                        For any other data item, a unique id is given when the item is added to the collection.
                        You use the Add and Update functions to put an item into a Collection control and change it afterwards.
                        You can use the Get function to look up an item by its id, or the GetAll function to get all the items.
                        The Remove function takes an item out of the collection
                        A Collection control would normally be kept hidden, with Display set to No, but you can set Display to Yes to
                        show the current data in order to understand more about what the app is doing.
                        A collection may be attached to a Data Store.
                        If it is, it will load any data already in the Data Store when the app starts, and any changes will be saved to the Data Store.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='any' helpId='data-initialValue'>The pre-filled data in the control when the app starts running.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' helpId='data-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>
                            <PropertyEntry name='Data Store' type='control' helpId='data-dataStore'>If this Collection is attached to a Data Store, the name of the Data Store control.</PropertyEntry>
                            <PropertyEntry name='Collection Name' type='text' helpId='data-collectionName'>If this Collection is attached to a Data Store, the name of the collection in the Data Store.
                                Most Data Stores can hold the data for more than one Collection, so this name tells the Data Store which part of the store to use for this collection's data.</PropertyEntry>
                        </>}
        />

        <ControlSection name='Data' helpId='data'
                        description='A Data control holds data used by the app while it is running.  When the browser page is closed, the data is deleted.
                        It can be used like a notepad to hold data needed temporarily.  A Data control can hold a simple values, a record or a list.
                        You use the Set and Update functions to put data into a Data control and change it afterwards.
                        You can use the data in the control simply by using its name in a formula.
                        A data control would normally be kept hidden, with Display set to No, but you can set Display to Yes to
                        show the current data in order to understand more about what the app is doing.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='any' helpId='data-initialValue'>The pre-filled data in the control when the app starts running.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' helpId='data-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>

                        </>}
        />

        <ControlSection name='File Data Store' helpId='fileDataStore'
                        description='Stores the data for one or more Collections in a disk file. The data is available to the Collections only when the Data Store is attached to a file.
                        To attach it to a file, the app needs to either open an existing file or save to a new or existing file.
                        To do this, the app needs to call either the Open, Save or SaveAs actions on the store, in response to a user clicking a button or a menu item.
                          For a store called MyFileDataStore you would include one of the following in the action: MyFileDataStore.Open(), MyFileDataStore.Save() or MyFileDataStore.SaveAs().
                          To the user, these look like the actions of opening or saving a file found in many programs.'
                        properties={<>
                            <Para>There are no properties to set.</Para>
                        </>}
        />

        <ControlSection name='Layout' helpId='layout'
                        description='Organises a group of controls within a page.  The controls contained in the layout can be arranged vertically, as normal, or horizontally.
                         Layouts can also contain other Layouts; one use of this is to split a Page into two columns, and display a group of controls on each side.
                          When doing this, it can be useful to set the Width property to allocate the right amount of the total width to each column'
                        properties={<>
                            <PropertyEntry name='Horizontal' type='true-false' helpId='layout-horizontal'>Whether the controls contained in the layout are arranged top to bottom or left to right (horizontal)</PropertyEntry>
                            <PropertyEntry name='Width' type='number of text' helpId='layout-width'>The width that this layout takes up.  A number gives a fixed number of pixels.
                                It can also be a percentage (eg 30%) to make this layout take up a certain proportion of the width of the Page or Layout that contains this one.</PropertyEntry>
                            <PropertyEntry name='Wrap' type='true-false' helpId='layout-wrap'>Whether the controls contained in a horizontal layout can  wrap around to the next row
                            if there is not enough room for them.  This can useful with responsive layouts that change the positions of the controls on different screen sizes.</PropertyEntry>

                        </>}
        />

        <ControlSection name='List' helpId='list'
                        description='Shows a list of similar items.  The user can select one of the items, and the app can use the selected item to control something else.
                        A common use of this is to show a list of names of items on one side of a page, and show full details of the item selected in the other side.
                        The List needs a list of items to show.  This could be just a fixed list like ["red", "green", "blue"], but it is usually a Collection.
                        The controls contained by the List control determine what is shown for each item - they are repeated for each item.
                        The List needs to contain at least one other control in order to display anything, but you can display anything you want for each item.
                         In order for the controls within the List to get the data for the current item, they an use a special name $item in their formulas.'
                        properties={<>
                            <PropertyEntry name='Items' type='list or Collection' helpId='list-items'>The items that are shown in this List.</PropertyEntry>
                            <PropertyEntry name='Width' type='number of text' helpId='list-width'>The width that this List takes up.  A number gives a fixed number of pixels.
                                It can also be a percentage (eg 30%) to make this control take up a certain proportion of the width of the Page or Layout that contains this one.</PropertyEntry>
                        </>}
        />

        <ControlSection name='Memory Data Store' helpId='memoryDataStore'
                        description='Stores the data for one or more Collections in the computer memory. The data will not be saved when the ptrogram stops running.
                        It can be given some initial data when the app starts.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='any' helpId='memoryDataStore-initialValue'>The pre-filled data in the store when the app starts running.</PropertyEntry>
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


        <ControlSection name='Page' helpId='page'
                        description='A Page control groups together a set of other controls that can be shown on the screen together.
                        A Page can only be inserted directly under the App.
                        To change the page shown on the screen, you use the Show() function.'
                        properties={<>
                        </>}
        />

        <ControlSection name='Project' helpId='project'
                        description='The top-level of a system that contains one or more Apps.'
                        properties={<>
                            <PropertyEntry name='Author' type='text' helpId='project-author'>Intended to hold the name of the developer of this Project.</PropertyEntry>
                        </>
                        }
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
                <PropertyEntry name='Width' type='number of text' helpId='layout-width'>The width that this control takes up.  A number gives a fixed number of pixels.
                    It can also be a percentage (eg 30%) to make this layout take up a certain proportion of the width of the Page or Layout that contains this control.</PropertyEntry>
                <PropertyEntry name='Label' type='text' helpId='textInput-label'>The descriptive label that is shown in or near the control.</PropertyEntry>
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

    </Section>

