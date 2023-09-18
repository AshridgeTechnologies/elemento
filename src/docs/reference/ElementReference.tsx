import React from 'react'
import {ElementSection, Heading, Para, PropertyEntry, Section, SubHeading, SubSection} from '../HelpComponents'
import {Link, List} from '@mui/material'

export default () =>
    <Section id='elements-reference'>
        <Heading>Elements Reference</Heading>
        <Para>
            This section explains, for every type of element, what it does and how to use it.
        </Para>

        <SubSection id='about-properties'>
            <SubHeading>About Properties</SubHeading>
            <Para>The most important thing to know about an element is what properties it has.
                You set the properties using fixed values or formulas to make your app do what you want.
            </Para>
            <Para>
                Some properties are <b>required</b> - the element will not work unless you set them.  Properties may have a <b>default</b> value -
                a built-in value that is used if you don't set one.
            </Para>
            <Para>
                Some properties are found in every type of element:
            </Para>
            <Para>
                <b>Id</b><br/>
                A name given to the element by the Elemento editor when it is added to the app.
                It cannot be changed, and it will be unique among the elements in the app.
            </Para>
            <Para>
                <b>Name</b><br/>
                The name of the element.  You may use this name in formulas to get the value of the element.
                In some cases the name is displayed on the page with the element.
            </Para>

            <Para>
                Some properties are found in several types of element:
            </Para>
            <Para>
                <b>Width</b><br/>
                If this is a number, it makes the element a fixed number of pixels wide.
                It can also be a percentage (eg 30%) to make the element take up a certain proportion of the width of the Page or Layout that contains this element.
            </Para>
            <Para>
                <b>Height</b><br/>
                Similar to Width
            </Para>

        </SubSection>

        <ElementSection name='App' id='app'
                        description='The top-level of an app that contains other elements.
            It contains the Pages displayed by the app, and it may contain an AppBar shown for every Page.
            It can also contain background elements like Data Stores and Collections.  These can be accessed anywhere in the app.'
                        properties={<>
                <PropertyEntry name='Author' type='text' id='app-author'>Intended to hold the name of the developer of this App.</PropertyEntry>
                <PropertyEntry name='Max Width' type='number' id='app-author'>The maximum width in pixels that the App will occupy on the screen.
                    See Width in the About Properties section above.
                </PropertyEntry>
            </>
            }
        />

        <ElementSection name='AppBar' id='appBar'
                        description='A bar shown at the top of the App above every Page.  It can be given a title to display, and it can also contain other elements. '
                        properties={<>
                <PropertyEntry name='Title' type='text' id='appBar-title'>The title displayed at the left, before any other elements in the app bar.</PropertyEntry>
            </>
            }
        />

        <ElementSection name='Browser Data Store' id='browserDataStore'
                        description='A datastore that uses the IndexedDB facility, a private, local data store managed by the browser (Chrome, Edge, etc).
                        This means that the data will be available indefinitely, but only on the computer or device where you create it,
                        and only when using the same browser to run the app.  It will not be possible for you to access the data from another computer,
                        or for other people to access the data.  For some apps, such as personal notes, this will be OK,
                        but think about what you might need to do now or in the future before choosing this type of data store.'
                        properties={<>
                <PropertyEntry name='Database Name' type='text' id='browserDataStore-databaseName'>
                    A name for the database this app will use.  It will usually be best to use the name of the App</PropertyEntry>
                <PropertyEntry name='Collection Names' type='list of text names' id='browserDataStore-collectionNames'>
                    A list of the names of the Collections that use this data store.
                    If you create a Collection and set its <code>Data Store</code> property to this data store, you must also add its <code>Collection
                    Name</code> to this list.</PropertyEntry>
            </>
            }
        />

        <ElementSection name='Button' id='button'
                        description='A Button element carries out an action when it is clicked.  You use an action formula to define what the button does.'
                        properties={<>
                <PropertyEntry name='Content' type='text' id='button-content'>The text that is displayed in the
                    button.</PropertyEntry>
                <PropertyEntry name='Appearance' type='choice of outline, filled or link' id='button-appearance'>
                    <dl>
                        <dt>Outline</dt>
                        <dd>The button is the background colour with a thin border</dd>
                        <dt>Filled</dt>
                        <dd>The button is filled with the main app colour</dd>
                        <dt>Link</dt>
                        <dd>The button looks like a link</dd>
                    </dl>
                    <strong>Note:</strong> A button in an App Bar will not show up properly unless it is filled.
                </PropertyEntry>
                <PropertyEntry name='Display' type='true-false' id='button-display'>Whether the button is shown on the screen.
                    Can be used with a Formula to show the element only under certain conditions.</PropertyEntry>
                <PropertyEntry name='Action' type='action-formula' id='button-action'>The action formula that is run when the button is clicked.
                    </PropertyEntry>
            </>
            }
        />

        <ElementSection name='Calculation' id='calculation'
                        description='AN element that holds a value calculated by a formula.
                        It can show the value on the page if you want, and the value can also be used by other elements.
                        If it is shown, it has a label to tell the user what the value is.'
                        properties={<>
                            <PropertyEntry name='Calculation' type='formula' id='calculation-calculation'>The formula to calculate the desired value.</PropertyEntry>
                            <PropertyEntry name='Label' type='text' id='calculation-label'>The descriptive label that is shown near the element.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='calculation-display'>Whether the calculation is shown on the screen.</PropertyEntry>
                            <PropertyEntry name='Width' type='number or text' id='calculation-width'>The width that this element takes up.  See Width in the About Properties section above. </PropertyEntry>
                        </>}
        />

        <ElementSection name='Collection' id='collection'
                        description={<>
                        <Para>A Collection element holds a group of data items used by the app while it is running.
                        When the browser page is closed, the data is deleted, unless the Collection is attached to a Data Store (see below).
                        It can be used like a set of pages in a notepad to hold data needed temporarily.
                        </Para>
                        <Para>
                        Each item in a Collection element can be a simple value, a record or a list.
                        Each item is associated with an id.  For a simple value, the id is the same as the value.
                        For a record with a property called "id" (lower case) the value of the property is used as the id.
                        For any other data item, a unique id is given when the item is added to the collection.
                        </Para>
                        <Para>
                        You use the Add and Update functions to put an item into a Collection element and change it afterwards.
                        You can use the Get function to look up an item by its id, or the GetAll function to get all the items.
                        The Remove function takes an item out of the collection
                        </Para>
                        <Para>
                        A Collection element would normally be kept hidden, with Display set to No, but you can set Display to Yes to
                        show the current data in order to understand more about what the app is doing.</Para>
                        <Para>
                        A collection may be attached to a Data Store.
                        If it is, it will load any data already in the Data Store when the app starts, and any changes will be saved to the Data Store.
                        </Para>
                        </>}
                        properties={<>
                            <PropertyEntry name='Initial Value' type='any' id='collection-initialValue'>The pre-filled data in the element when the app starts running.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='collection-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>
                            <PropertyEntry name='Data Store' type='element' id='collection-dataStore'>If this Collection is attached to a Data Store, the name of the Data Store element.</PropertyEntry>
                            <PropertyEntry name='Collection Name' type='text' id='collection-collectionName'>If this Collection is attached to a Data Store, the name of the collection in the Data Store.
                                Data Stores can hold the data for more than one Collection, so this name tells the Data Store which part of the store to use for this collection's data.</PropertyEntry>
                        </>}
        />

        <ElementSection name='Data' id='data'
                        description='A Data element holds data used by the app while it is running.  When the browser page is closed, the data is deleted.
                        It can be used like a notepad to hold data needed temporarily.  A Data element can hold a simple values, a record or a list.
                        You use the Set and Update functions to put data into a Data element and change it afterwards.
                        You can use the data in the element simply by using its name in a formula.
                        A data element would normally be kept hidden, with Display set to No, but you can set Display to Yes to
                        show the current data in order to understand more about what the app is doing.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='any' id='data-initialValue'>The pre-filled data in the element when the app starts running.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='data-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>

                        </>}
        />

        <ElementSection name='Date Input' id='dateInput'
                        description='A Date Input element is a box where the user can enter a date.
                        It can also display a date picker for the user to choose the date.
                        It can be given a pre-filled value which the user can change or replace.
                        It has a label that is shown in or near the element to tell the user what the date entered is for.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='number' id='dateInput-initialValue'>The pre-filled date that is displayed when the element is first shown.</PropertyEntry>
                            <PropertyEntry name='Label' type='text' id='dateInput-label'>The descriptive label that is shown in or near the element.</PropertyEntry>
                            <PropertyEntry name='Read Only' type='true-false' id='dateInput-readOnly'>Whether the date shown is read-only ie cannot be changed by the user.</PropertyEntry>
                            <PropertyEntry name='Data Type' type='data type' id='dateInput-dataType'>
                                The name of a Data Type defined elsewhere in the project that gives more information about the data entered in this element.</PropertyEntry>
                        </>}
        />

        <ElementSection name='File' id='file'
                        description='A file that is uploaded for use in the app, for example an image file, which would be used in an Image element.
                        A File can only be created under the Files folder, with the Upload command.
                        '
                        properties={<>
                            <Para>There are no properties to set.</Para>
                        </>}
        />

        <ElementSection name='File Data Store' id='fileDataStore'
                        description='Stores the data for one or more Collections in a disk file. The data is available to the Collections only when the Data Store is attached to a file.
                        To attach it to a file, the app needs to either open an existing file or save to a new or existing file.
                        To do this, the app needs to call either the Open, Save or SaveAs actions on the store, in response to a user clicking a button or a menu item.
                          For a store called MyFileDataStore you would include one of the following in the action: MyFileDataStore.Open(), MyFileDataStore.Save() or MyFileDataStore.SaveAs().
                          To the user, these look like the actions of opening or saving a file found in many programs.'
                        properties={<>
                            <Para>There are no properties to set.</Para>
                        </>}
        />

        <ElementSection name='Firestore Data Store' id='firestoreDataStore'
                        description='A datastore that uses Google Firestore, a cloud datastore where data is held on Google servers.
                        The data will be available indefinitely, and can be accessed from any computer or device connected to the internet,
                        either by you alone or by other people, depending on how you set up the datastore.
                        You will need to have a Google account, and set up a Firebase project.
                        You will also need to provide payment details, but there is a generous free allowance.
                        This type of data store is best for applications where you need to access the data from different computers, and/or allow access by multiple people.'
                        properties={<>
                            <PropertyEntry name='Collection Names' type='list of text names' id='firestoreDataStore-collectionNames'>
                                A list of the names of the Collections that use this data store.
                                If you create a Collection and set its <code>Data Store</code> property to this data store, you must also add its <code>Collection
                                Name</code> to this list.</PropertyEntry>
                        </>
                        }
        />

        <ElementSection name='Form' id='form'
                        description='Organises a group of elements within a page that show and update the data for the items in a Record.
                        The Form can be given a Record containing the initial values, and it provides a value property which is a new Record containing all the updated values.
                        It has a label that is shown above the Form to tell the user what the details shown relate to.
                         The elements in the form can be arranged vertically (the normal way), or horizontally.
                         Forms can also contain other Forms.  This can be useful when one of the items in the Record is itself a Record, such as an Address record  within an Order record'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='record' id='form-initialValue'>The Record with the values that are displayed when the form is first shown.</PropertyEntry>
                            <PropertyEntry name='Label' type='text' id='form-label'>The descriptive label that is shown with the Form.</PropertyEntry>
                            <PropertyEntry name='Read Only' type='true-false' id='form-readOnly'>Whether the elements contained in the form can be updated or only viewed</PropertyEntry>
                            <PropertyEntry name='Data Type' type='data type' id='form-dataType'>
                                The name of a Data Type defined elsewhere in the project that gives more information about the data entered in this form.</PropertyEntry>
                            <PropertyEntry name='Horizontal' type='true-false' id='form-horizontal'>Whether the elements contained in the form are arranged top to bottom or left to right (horizontal)</PropertyEntry>
                            <PropertyEntry name='Width' type='number or text' id='form-width'>The width that this form takes up.  See Width in the About Properties section above.</PropertyEntry>
                            <PropertyEntry name='Wrap' type='true-false' id='form-wrap'>Whether the elements contained in a horizontal form can  wrap around to the next row
                            if there is not enough room for them.  This can useful with responsive layouts that change the positions of the elements on different screen sizes.</PropertyEntry>
                            <PropertyEntry name='Key Action' type='action-formula' id='form-keyAction'>The action formula that is run when a key is pressed in an element in the form.
                                You can use the special value <code>$key</code> in the formula to get the key that was pressed.
                            One use of this is to submit the form when Enter is pressed.</PropertyEntry>
                            <PropertyEntry name='Submit Action' type='action-formula' id='form-submitAction'>The action formula that is run when the form is submitted
                                by calling the Submit function.
                            A common use of this is to save the current value of the form as a record in a datastore.
                            You can use the special value <code>$form</code> in the formula to access the form, and the special value <code>$data</code> to access any extra
                                data passed to the Submit function.
                            </PropertyEntry>
                        </>}
        />

        <ElementSection name='FunctionDef' id='functionDef'
                        description='Defines a named function that does a calculation or performs an action, that can be called from formulas in other elements.
                        This is useful if you want to use the same action or calculation in different places,
                        or if a formula is getting large and you want to split it up.  You call the function in the same way as a built-in function.
                        You can have up to 5 named inputs to the function.'
                        properties={<>
                            <PropertyEntry name='Input 1' type='text' id='functionDef-input1'>The name of the first input to the function</PropertyEntry>
                            <PropertyEntry name='Input 2-5' type='text' id='functionDef-input1'>The name of the other inputs to the function</PropertyEntry>
                            <PropertyEntry name='Action' type='true-false' id='functionDef-action'>Whether the function does an action, or is just a calculation that does not update anything.</PropertyEntry>
                            <PropertyEntry name='Calculation' type='formula' id='functionDef-calculation'>The formula to calculate the desired value or do the action.</PropertyEntry>
                            <PropertyEntry name='Private' type='true-false' id='functionDef-private'>In a Server App, indicates that this function is only for use inside the app,
                            and cannot be called from other apps.</PropertyEntry>
                            <PropertyEntry name='Javascript' type='true-false' id='functionDef-javascript'>The Calculation is treated as plain JavaScript, rather than an Elemento formula.</PropertyEntry>
                        </>}
        />

        <ElementSection name='FunctionImport' id='functionImport'
                        description='Defines a JavaScript function imported from another source, such as a CDN.'
                        properties={<>
                            <PropertyEntry name='Source' type='text' id='functionImport-source'>Either the URL of a
                                JavaScript module available on the web, or the name
                                of a File included in the project that contains a JavaScript module.</PropertyEntry>
                            <PropertyEntry name='Export Name' type='text' id='functionImport-exportName'>If the
                                function you want to import is not the default function
                                in the module, enter the export name here.</PropertyEntry>
                        </>}/>

        <ElementSection name='Icon' id='icon'
                        description='Displays an icon, which can also act as a button and perform an action when it is clicked.'
                        properties={<>
                            <PropertyEntry name='Icon Name' type='text' id='icon-iconName'>The name of the icon to show.
                                Must be the name of a Material Icon, all lower case, with underscores between words.
                                Eg for the Check Circle Outline icon use the name check_circle_outline.
                            Find the icons available on the <Link href='https://fonts.google.com/icons?icon.set=Material+Icons' target='_blank'>Material Icons website</Link>
                            </PropertyEntry>
                            <PropertyEntry name='Font Size' type='number' id='icon-fontSize'>The size of the icon that is displayed, in pixels.</PropertyEntry>
                            <PropertyEntry name='Color' type='text' id='icon-color'>The color of the text displayed.
                                Most plain color names like 'green' will work, and you can find more in <Link
                                    href='https://www.w3schools.com/cssref/css_colors.asp' target='_blank'>this
                                    article</Link></PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='icon-display'>Whether the icon is shown on the screen.
                                Can be used with a Formula to show it only under certain conditions.</PropertyEntry>
                            <PropertyEntry name='Action' type='action-formula' id='icon-action'>The action formula that is run when the icon is clicked.
                            </PropertyEntry>
                        </>}
        />

        <ElementSection name='Image' id='image'
                        description='Displays an image.'
                        properties={<>
                            <PropertyEntry name='Source' type='text' id='image-source'>Either the URL of an image available on the web, or the name
                                of a File included in the project that contains an image.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='image-display'>Whether the image is shown on the screen.
                                Can be used with a Formula to show it only under certain conditions.</PropertyEntry>
                            <PropertyEntry name='Width' type='number or text' id='image-width'>The width of this image on the screen.  See Width in the About Properties section above.</PropertyEntry>
                            <PropertyEntry name='Height' type='number or text' id='image-height'>The height of this image on the screen.  See Height in the About Properties section above.</PropertyEntry>
                            <PropertyEntry name='Margin Bottom' type='number or text' id='image-marginBottom'>The space below this image on the screen.</PropertyEntry>
                            <PropertyEntry name='Description' type='text' id='image-description'>A description of this image, used by screen readers.</PropertyEntry>
                        </>}
        />

        <ElementSection name='Layout' id='layout'
                        description='Organises a group of elements within a page.  The elements contained in the layout can be arranged vertically, as normal, or horizontally.
                         Layouts can also contain other Layouts; one use of this is to split a Page into two columns, and display a group of elements on each side.
                          When doing this, it can be useful to set the Width property to allocate the right amount of the total width to each column'
                        properties={<>
                            <PropertyEntry name='Horizontal' type='true-false' id='layout-horizontal'>Whether the elements contained in the layout are arranged top to bottom or left to right (horizontal)</PropertyEntry>
                            <PropertyEntry name='Width' type='number or text' id='layout-width'>The width that this layout takes up.  See Width in the About Properties section above.</PropertyEntry>
                            <PropertyEntry name='Wrap' type='true-false' id='layout-wrap'>Whether the elements contained in a horizontal layout can  wrap around to the next row
                            if there is not enough room for them.  This can useful with responsive layouts that change the positions of the elements on different screen sizes.</PropertyEntry>
                            <PropertyEntry name='Background Color' type='text' id='layout-backgroundColor'>The colour of the background of the layout.
                                See the <b>color</b> property for the names you can use.</PropertyEntry>                        </>}
        />

        <ElementSection name='List' id='list'
                        description='Shows a list of similar items.  The user can select one of the items, and the app can use the selected item to control something else.
                        A common use of this is to show a list of names of items on one side of a page, and show full details of the item selected in the other side.
                        The List needs a list of items to show.  This could be just a fixed list like ["red", "green", "blue"], but it is usually a Collection.
                        The elements contained by the List element determine what is shown for each item - they are repeated for each item.
                        The List needs to contain at least one other element in order to display anything, but you can display anything you want for each item.
                         In order for the elements within the List to get the data for the current item, they can use a special name $item in their formulas.'
                        properties={<>
                            <PropertyEntry name='Items' type='list or Collection' id='list-items'>The items that are shown in this List.</PropertyEntry>
                            <PropertyEntry name='Selected Item' type='one of the Items or its Id' id='list-selectedItem'>The item that is initially selected, until the user selects another.</PropertyEntry>
                            <PropertyEntry name='Width' type='number or text' id='list-width'>The width that this List takes up.  See Width in the About Properties section above.</PropertyEntry>
                            <PropertyEntry name='Selectable' type='true-false' id='list-selectable'>Whether items in the list can be selected.</PropertyEntry>
                            <PropertyEntry name='Select Action' type='action-formula' id='list-selectAction'>The action formula that is run when an item is selected.
                                The formula can use the special name <code>$item</code> for the item that has just been selected.
                            </PropertyEntry>
                        </>}
        />

        <ElementSection name='Memory Data Store' id='memoryDataStore'
                        description='Stores the data for one or more Collections in the computer memory. The data will not be saved when the app stops running.
                        It can be given some initial data when the app starts.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='any' id='memoryDataStore-initialValue'>The pre-filled data in the store when the app starts running.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='memoryDataStore-display'>Whether the current data is shown on the screen.  Normally set to No.</PropertyEntry>
                        </>}
        />

        <ElementSection name='Menu' id='menu'
                        description='Displays a button that, when clicked, shows a list of Menu Items that the user can select.'
                        properties={<>
                            <PropertyEntry name='Label' type='text' id='menu-label'>The label in the button that displays the menu.</PropertyEntry>
                            <PropertyEntry name='Filled' type='true-false' id='menu-filled'>Whether the label in the button is filled with the main app colour.</PropertyEntry>
                        </>}
        />

        <ElementSection name='Menu Item' id='menuItem'
                        description='One of the choices in a Menu.'
                        properties={<>
                            <PropertyEntry name='Label' type='text' id='menuItem-label'>The text of this choice when the Menu is displayed.</PropertyEntry>
                            <PropertyEntry name='Display' type='true-false' id='menuItem-display'>Whether this item is displayed.
                                Can use a formula to display an item only under certain conditions.</PropertyEntry>
                            <PropertyEntry name='Action' type='action-formula' id='menuItem-action'>The action formula that is run when this item is selected.
                            </PropertyEntry>
                        </>}
        />

        <ElementSection name='Number Input' id='numberInput'
                        description='A Number Input element is a box where the user can enter a number.
                        It can be given a pre-filled value which the user can change or replace.
                        It has a label that is shown in or near the element to tell the user what the number entered is for.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='number' id='numberInput-initialValue'>The pre-filled number that is displayed when the element is first shown.</PropertyEntry>
                            <PropertyEntry name='Label' type='text' id='numberInput-label'>The descriptive label that is shown in or near the element.</PropertyEntry>
                            <PropertyEntry name='Read Only' type='true-false' id='numberInput-readOnly'>Whether the number shown is read-only ie cannot be changed by the user.</PropertyEntry>
                            <PropertyEntry name='Data Type' type='data type' id='numberInput-dataType'>
                                The name of a Data Type defined elsewhere in the project that gives more information about the data entered in this element.</PropertyEntry>
                        </>}
        />


        <ElementSection name='Page' id='page'
                        description='A Page element groups together a set of other elements that can be shown on the screen together.
                        A Page can only be inserted directly under the App.
                        To change the page shown on the screen, you use the Show() function.'
                        properties={<>
                            <Para>There are no properties to set for a Page</Para>
                        </>}
        />

        <ElementSection name='Project' id='project'
                        description='The top-level of a system that contains one or more Apps.'
                        properties={<>
                            <PropertyEntry name='Author' type='text' id='project-author'>Intended to hold the name of the developer of this Project.</PropertyEntry>
                        </>
                        }
        />

        <ElementSection name='Select Input' id='selectInput'
                        description='A Select Input element presents a number of options that the user can choose.
                        It can be given a pre-filled value which the user can change.
                        It has a label that is shown in or near the element to tell the user what the choice is for.'
                        properties={<>
                            <PropertyEntry name='Initial Value' type='string' id='selectInput-initialValue'>
                                The pre-filled option that is displayed when the element is first shown.  Must be one of the items in the Values property.</PropertyEntry>
                            <PropertyEntry name='Label' type='text' id='selectInput-label'>The descriptive label that is shown in or near the element.</PropertyEntry>
                            <PropertyEntry name='Read Only' type='true-false' id='selectInput-readOnly'>Whether the option shown is read-only ie cannot be changed by the user.</PropertyEntry>
                            <PropertyEntry name='Data Type' type='data type' id='selectInput-dataType'>
                                The name of a Data Type defined elsewhere in the project that gives more information about the data entered in this element.</PropertyEntry>
                            <PropertyEntry name='Values' type='list of string' id='selectInput-values'>The options that the user can choose from.</PropertyEntry>
                        </>}
        />

        <ElementSection name='Server App' id='serverApp'
                        description='The top-level of a server app that can run in the cloud rather than the browser.
                        It is used where actions and data access need to validated or controlled according to the permissions of the user.
                        It can contain only Functions, Collections and Firestore Data Stores.
                        Each Function can be accessed from browser formulas and actions via a Server App Connector.
                        Server Apps are intended for advanced users and require setting up an account with a cloud service such as Google Firebase'
                        properties={<>
                            <Para>There are no properties to set for a Page</Para>
                        </>
                        }
        />

        <ElementSection name='Server App Connector' id='serverAppConnector'
                        description='Used in a browser App to access functions in a Server App.
                        In formulas and actions you can write <ServerAppConnectorName>.<FunctionName>(inputs...) '
                        properties={<>
                            <PropertyEntry name='Server App' type='Server App' id='serverAppConnector-serverApp'>The name of a Server App in this project</PropertyEntry>
                            <PropertyEntry name='Server Url' type='Server Url' id='serverAppConnector-serverUrl'>The URL at which the running Server App can be accessed.</PropertyEntry>
                        </>
                        }
        />

        <ElementSection name='Speech Input' id='speechInput'
                        description='Allows the app to recognise short speech phrases.'
                        properties={<>
                            <PropertyEntry name='Language' type='text' id='speechInput-language'>The code for the language of the expected speech.
                                A full list of these codes can be found <Link href='https://www.andiamo.co.uk/resources/iso-language-codes/'>here</Link>,
                                but browser speech recognition will only support some of these languages.</PropertyEntry>
                            <PropertyEntry name='Expected Phrases' type='list of text phrases' id='speechInput-expectedPhrases'>
                                A list of expected phrases.  Browsers may still attempt to recognise the speech even if it is not one of these phrases.</PropertyEntry>
                        </>
                        }
        />


        <ElementSection name='Text' id='text'
                        description='A Text element simply displays a section of text.  The Name is not shown.
                        You can set various properties to control how the text is displayed.'
                        properties={<>
                <PropertyEntry name='Content' type='text' id='text-content'>The text that is displayed.</PropertyEntry>
                <PropertyEntry name='Font Size' type='number' id='text-fontSize'>The size of the text that is displayed, in pixels.</PropertyEntry>
                <PropertyEntry name='Font Family' type='number' id='text-fontSize'>The name of the typeface of the text that is displayed.
                    Knowing what names you can use is a big subject, but you could start with <Link href='https://blog.hubspot.com/website/web-safe-html-css-fonts' target='_blank'>this article</Link>.
                </PropertyEntry>
                <PropertyEntry name='Color' type='text' id='text-color'>The color of the text displayed.
                        Most plain color names like 'green' will work, and you can find more in <Link href='https://www.w3schools.com/cssref/css_colors.asp' target='_blank'>this article</Link></PropertyEntry>
                <PropertyEntry name='Background Color' type='text' id='text-backgroundColor'>The color of the background of the text section.
                        See the <b>Color</b> property for the color names you can use.</PropertyEntry>
                <PropertyEntry name='Border' type='text' id='text-border'>The size of the border around the text section, in pixels.
                </PropertyEntry>
                <PropertyEntry name='Border Color' type='text' id='text-borderColor'>The color of the border around the text section.
                        See the <b>Color</b> property for the color names you can use.</PropertyEntry>
                <PropertyEntry name='Width' type='number' id='text-width'>The width of the text section displayed, in pixels.</PropertyEntry>
                <PropertyEntry name='Height' type='number' id='text-height'>The height of the text section displayed, in pixels.</PropertyEntry>
                <PropertyEntry name='Margin Bottom' type='number' id='text-marginBottom'>The spacing below the text section displayed, in pixels.</PropertyEntry>
            </>}
        />

        <ElementSection name='Text Input' id='textInput'
                        description='A Text Input element is a box where the user can enter some text.
                        It can be given some pre-filled text which the user can change or replace.
                        It has a label that is shown in or near the element to tell the user what the text entered is for.'
                        properties={<>
                <PropertyEntry name='Initial Value' type='text' id='textInput-initialValue'>The pre-filled text that is displayed when the element is first shown.</PropertyEntry>
                <PropertyEntry name='Label' type='text' id='textInput-label'>The descriptive label that is shown in or near the element.</PropertyEntry>
                <PropertyEntry name='Read Only' type='true-false' id='textInput-readOnly'>Whether the text shown is read-only ie cannot be changed by the user.</PropertyEntry>
                <PropertyEntry name='Data Type' type='data type' id='textInput-dataType'>
                    The name of a Data Type defined elsewhere in the project that gives more information about the data entered in this element.</PropertyEntry>
                <PropertyEntry name='Width' type='number or text' id='textInput-width'>The width that this element takes up.
                    See Width in the About Properties section above.</PropertyEntry>
                <PropertyEntry name='Multiline' type='true-false' id='textInput-multiline'>Whether text can be entered on multiple lines.</PropertyEntry>
            </>}
        />

        <ElementSection name='Tool' id='tool'
                        description='The top-level of a special kind of App that is used only for developing the Project.
                                    It contains Pages and other elements like an App.  It can be shown in the Tool Window.
                                    Tools can access and control the Studio Editor and Preview'
                        properties={<>
                            <PropertyEntry name='Author' type='text' id='app-author'>Intended to hold the name of the developer of this Tool.</PropertyEntry>
                            <PropertyEntry name='Max Width' type='number' id='app-author'>The maximum width in pixels that the Tool will occupy on the screen.
                                See Width in the About Properties section above.
                            </PropertyEntry>
                        </>
                        }
        />

        <ElementSection name='ToolImport' id='toolImport'
                        description='Defines a Tool imported from another source, such as a CDN.'
                        properties={<>
                            <PropertyEntry name='Source' type='text' id='toolImport-source'>The URL of a
                                Tool module available on the web.</PropertyEntry>
                            <PropertyEntry name='Studio Access' type='true-false' id='toolImport-studioAccess'>
                                Whether the imported Tool is trusted to access and control the Studio.
                            </PropertyEntry>
                        </>}/>

        <ElementSection name='True-False Input' id='trueFalseInput'
                        description='A True-False Input element lets the user set something to either true or false (yes or no).
                        It can be given a pre-filled value which the user can change.
                        It has a label that is shown in or near the element to tell the user what the true-false setting is for.'
                        properties={<>
                <PropertyEntry name='Initial Value' type='true-false' id='trueFalseInput-initialValue'>The pre-filled true-false value that is displayed when the element is first shown.</PropertyEntry>
                <PropertyEntry name='Label' type='text' id='trueFalseInput-label'>The descriptive label that is shown in or near the element.</PropertyEntry>
                <PropertyEntry name='Read Only' type='true-false' id='trueFalseInput-readOnly'>Whether the true-false value shown is read-only ie cannot be changed by the user.</PropertyEntry>
                <PropertyEntry name='Data Type' type='data type' id='trueFalseInput-dataType'>
                    The name of a Data Type defined elsewhere in the project that gives more information about the data entered in this element.</PropertyEntry>
            </>}
        />

        <ElementSection name='User Logon' id='userLogon'
                        description='A button that displays a window so that the user can log on with Google Firebase authentication.
            This is needed to use a Firestore Data Store and possibly other Google facilities in the future.'
                        properties={<>
                <Para>There are no properties to set.</Para>
            </>}
        />
    </Section>

