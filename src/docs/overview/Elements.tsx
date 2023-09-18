import React from 'react'
import {
    BulletList,
    Heading,
    MinorHeading,
    NamedList,
    NumberedList,
    Para,
    Section,
    SubHeading,
    SubSection
} from '../HelpComponents'

export default () =>
    <Section id='elements'>
        <Heading>Elements</Heading>
        <Para>
            Elements are the things you see on the screen when your app runs,
            like boxes to input text, checkboxes to indicate yes or no, lists of items, buttons to make something happen - or just plain chunks of text.
        </Para>

        <SubSection id='types-of-element'>
            <SubHeading>Types of Element</SubHeading>
            <Para>There are several types of element:</Para>
            <NamedList>
                <dt>Display</dt>
                <dd>Elements that just show information</dd>
                <dd>Examples: Text</dd>

                <dt>Input</dt>
                <dd>For entering information or choosing values</dd>
                <dd>Examples: Text Input, Select Input</dd>

                <dt>Action</dt>
                <dd>For making the app do something</dd>
                <dd>Examples: Button, Menu Item</dd>

                <dt>Container</dt>
                <dd>To contain other components and organise them on the page</dd>
                <dd>Examples: Layout, Menu, List, Page</dd>

                <dt>Background</dt>
                <dd>For holding data, getting data from elsewhere or doing calculations. They do not normally display
                    anything on the page.
                </dd>
                <dd>Examples: Data, Function, File Data Store</dd>

            </NamedList>
        </SubSection>


        <SubSection id='adding-an-element'>
            <SubHeading>Adding an element to your app</SubHeading>
            <NumberedList>
                <li>Find an existing element in the Navigator that is close to where you want the new one to be.</li>
                <li>Right-click the element, and click one of the Insert options on the menu that appears.
                    <BulletList>
                        <li>Insert before - to put the new element before (above) this one</li>
                        <li>Insert after - to put the new element after (below) this one</li>
                        <li>Insert inside - to put the new element <em>inside</em> this one.  Only appears for Page and other container elements</li>
                    </BulletList>
                    </li>
                <li>A list of the elements that can be in that position now appears</li>
                <li>Click the name of the element you want to add.  It will show in the Navigator, selected as the current element.</li>
                <li>The properties of the new element will be shown in the Properties panel.  Set these up as you want them - see below.</li>
            </NumberedList>
            <Para>
                You will also see the new element immediately in the App Preview.
            </Para>
        </SubSection>


        <SubSection id='naming-an-element'>
            <SubHeading>Naming the element</SubHeading>
            <Para>
                Every element is assigned a default name when you add it, like "Text Input 14".
                You will usually want to change this to something meaningful, like "City" or "Number of Items".
            </Para>
            <Para>
                This is most important for elements where you input something and use the name in formulas,
                but it is also useful for other elements, as it helps you remember what each one is there for.
            </Para>
            <Para>You change the name in the large box at the top of the Properties panel</Para>
            <Para>
                Names need to be unique within a Page, but you can have elements with the same name in different pages.
            </Para>

            <MinorHeading>Using the element in formulas</MinorHeading>
            <Para>You can have spaces in the name of an element if you want, but when you refer to the element in a formula,
                you must use the name <strong>without any spaces</strong>*.
                So if you called an element "Number Of Tickets" you would write "NumberOfTickets" in a formula.
            </Para>
            <Para>The Formula Name box next to the name shows the correct name to use.</Para>
            <Para>* - <em>Sorry - it just gets too complicated to work out what a formula means otherwise</em>.</Para>
        </SubSection>


            <SubSection id='element-properties'>
            <SubHeading>Properties</SubHeading>
            <Para>
                Every element has properties that affect how it looks and what it does.
                When you select an element in the Navigator by clicking on it, its properties appear in the Properties Panel.
            </Para>
            <Para>Each type of element has its own particular set of properties. Some properties, like Width or
                Font Size, are found on many types of element,
                but other properties are unique to one type.
            </Para>
            <Para>
                You can set what you want each property to be in the box beside the name.  The property value can be either a fixed value or a calculation - see Formulas.
            </Para>

            <Para>
                You don't have to set up every property.  Some properties will have a default value that is already entered for you, or they can just be left empty.
                You will only set these properties in a few cases when you have a particular need. It's a bit like formatting a paragraph in a word processor:
                there are all sorts of styles and things you can tweak, but most of the time you only need to change one or two of them and leave the rest alone.
            </Para>
            <Para>The help section for each element type describes all the properties and what you can do with them.</Para>
            <Para>
                As you change property values, you can see the effect immediately in the App Preview.  If you don't like what you see, just change it back or try something else.
            </Para>
            <Para>Property values that affect the size of something on the screen are given in <b>pixels.</b>
                A pixel is one of the tiny dots that make up the screen display.
                A typical computer screen is 1920 pixels wide and 1080 high.  A normal character on the screen is between 10 and 20 pixels tall.</Para>
        </SubSection>
    </Section>
