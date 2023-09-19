import React from 'react'
import {
    BulletList,
    Heading, HelpLink,
    MinorHeading,
    NamedList, NLItem,
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
            Elements are the parts that you connect together to build your app. Most of them are things you see on the screen when your app runs,
            like boxes to input text, checkboxes to indicate yes or no, lists of items, buttons to make something happen - or just plain chunks of
            text.
            Some others do things in the background, like <HelpLink id='storing-data'>storing data</HelpLink>.
        </Para>

        <SubSection id='types-of-element'>
            <SubHeading>Types of Element</SubHeading>
            <Para>There are several types of element:</Para>
            <NamedList>
                <NLItem name='Display'>
                    <Para>Elements that just show information</Para>
                    <Para>Examples: <HelpLink id='text'/></Para>
                </NLItem>
                <NLItem name='Input'>
                    <Para>For entering information or choosing values</Para>
                    <Para>Examples: <HelpLink id='textInput'/>, <HelpLink id='selectInput'/></Para>
                </NLItem>
                <NLItem name='Action'>
                    <Para>For making the app do something</Para>
                    <Para>Examples: <HelpLink id='button'/>, <HelpLink id='menuItem'/></Para>
                </NLItem>
                <NLItem name='Container'>
                    <Para>To contain other element and organise them on the page</Para>
                    <Para>Examples: <HelpLink id='layout'/>, <HelpLink id='menu'/>, <HelpLink id='list'/>, <HelpLink id='page'/></Para>
                </NLItem>
                <NLItem name='Background'>
                    <Para>For holding data, getting data from elsewhere or doing calculations. They do not normally display
                        anything on the page.
                    </Para>
                    <Para>Examples: <HelpLink id='data'/>, <HelpLink id='function'/>, <HelpLink id='fileDataStore'/></Para>
                </NLItem>
            </NamedList>
        </SubSection>


        <SubSection id='adding-an-element'>
            <SubHeading>Adding an element to your app</SubHeading>
            <NumberedList>
                <li>Find an existing element in the <HelpLink id='navigator'/> that is close to where you want the new one to be.</li>
                <li>Right-click the element, and click Insert on the menu that appears.</li>
                <li>In the new menu that appears, at the left hand side, select the option for where you want to the new element to be:
                    <BulletList>
                        <li>Before - to put the new element before (above) this one</li>
                        <li>After - to put the new element after (below) this one</li>
                        <li>Inside - to put the new element <em>inside</em> this one. Only appears for Page and other container elements</li>
                    </BulletList>
                </li>
                <li>A list of the elements that can be in that position shows at the right hand side of the menu</li>
                <li>Click the name of the element you want to add. It will show in the Navigator, selected as the current element.</li>
                <li>The properties of the new element will be shown in the <HelpLink id='properties-panel'/>. Set these up as you want them - see
                    below.
                </li>
            </NumberedList>
            <Para>
                You will also see the new element immediately in the <HelpLink id='app-preview'/> (unless it is a background element).
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
            <Para>You change the name in the large box at the top of the <HelpLink id='properties-panel'/>.
                Unlike the other element properties, you need to press Enter to confirm the rename.</Para>
            <Para>
                Names need to be unique within a <HelpLink id='page'/>, but you can have elements with the same name in different Pages.
            </Para>

            <MinorHeading>Using the element in formulas</MinorHeading>
            <Para>You can have spaces in the name of an element if you want, but when you refer to the element in a <HelpLink
                id='formulas'>formula</HelpLink>,
                you must use the name <strong>without any spaces</strong>, or it would get too difficult to work out what a formula means.
                So if you called an element "Number Of Tickets" you would write "NumberOfTickets" in a formula.
            </Para>
            <Para>The Formula Name box next to the name shows the correct name to use.</Para>
        </SubSection>


        <SubSection id='element-properties'>
            <SubHeading>Properties</SubHeading>
            <Para>
                Every element has properties that affect how it looks and what it does.
                When you select an element in the <HelpLink id='navigator'/> by clicking on it, its properties appear in the <HelpLink
                id='properties-panel'/>.
            </Para>
            <Para>Each type of element has its own particular set of properties. Some properties, like Width or
                Font Size, are found on many types of element, but other properties are unique to one type.
            </Para>
            <Para>
                You can set what you want each property to be in the box beside the name.
                The property value can be either a fixed value or a calculation - see <HelpLink id='formulas'/>.
            </Para>

            <Para>
                You don't have to set up every property. Some properties will have a default value that is already entered for you, or they can just
                be left empty.
                You will only set these properties in a few cases when you have a particular need. It's a bit like formatting a paragraph in a word
                processor:
                there are all sorts of styles and things you can tweak, but most of the time you only need to change one or two of them and leave the
                rest alone.
            </Para>
            <Para>The <HelpLink id='elements-reference'>help section for each element type</HelpLink> describes all the properties and what you can do
                with them.</Para>
            <Para>
                As you change property values, you can see the effect immediately in the <HelpLink id='app-preview'/>.
                If you don't like what you see, just change it back or try something else.
            </Para>
            <Para>Property values that affect the size of something on the screen are given in <b>pixels.</b>
                A pixel is one of the tiny dots that make up the screen display.
                A typical computer screen is 1920 pixels wide and 1080 high. A normal character on the screen is between 10 and 20 pixels tall.</Para>
        </SubSection>
    </Section>
