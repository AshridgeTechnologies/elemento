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
import controlReference from '../reference/ControlReference'

export default () =>
    <Section helpId='controls'>
        <Heading>Controls</Heading>
        <Para>
            Controls are the things you see on the screen when your app runs,
            like boxes to input text, checkboxes to indicate yes or no, lists of items, buttons to make something happen - or just plain chunks of text.
            They are called "controls" because they are bit like the knobs, switches, lights or labels on the control panel of a machine.
        </Para>

        <SubSection helpId='types-of-control'>
            <SubHeading>Types of Control</SubHeading>
            <Para>There are several types of control:</Para>
            <NamedList>
                <dt>Display</dt>
                <dd>Controls that just show information</dd>
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


        <SubSection helpId='adding-a-control'>
            <SubHeading>Adding a control to your app</SubHeading>
            <NumberedList>
                <li>Find an existing control in the Navigator that is close to where you want the new one to be.</li>
                <li>Right-click the Control, and click one of the Insert options on the menu that appears.
                    <BulletList>
                        <li>Insert before - to put the new control before (above) this one</li>
                        <li>Insert after - to put the new control after (below) this one</li>
                        <li>Insert inside - to put the new control <em>inside</em> this one.  Only appears for Page and other container controls</li>
                    </BulletList>
                    </li>
                <li>A list of the controls that can be in that position now appears</li>
                <li>Click the name of the control you want to add.  It will show in the Navigator, selected as the current control.</li>
                <li>The properties of the new control will be shown in the Properties panel.  Set these up as you want them - see below.</li>
            </NumberedList>
            <Para>
                You will also see the new control immediately in the App Preview.
            </Para>
        </SubSection>


        <SubSection helpId='naming-a-control'>
            <SubHeading>Naming the control</SubHeading>
            <Para>
                Every control is assigned a default name when you add it, like "Text Input 14".
                You will usually want to change this to something meaningful, like "City" or "Number of Items".
            </Para>
            <Para>
                This is most important for controls where you input something and use the name in formulas,
                but it is also useful for other controls, as it helps you remember what each one is there for.
            </Para>
            <Para>You change the name in the large box at the top of the Properties panel</Para>
            <Para>
                Names need to be unique within a Page, but you can have controls with the same name in different pages.
            </Para>

            <MinorHeading>Using the control in formulas</MinorHeading>
            <Para>You can have spaces in the name of a control if you want, but when you refer to the control in a formula,
                you must use the name <strong>without any spaces</strong>*.
                So if you called a control "Number Of Tickets" you would write "NumberOfTickets" in a formula.
                <Para>The Formula Name box next to the name shows the correct name to use.</Para>
                <Para>* - <em>Sorry - it just gets too complicated to work out what a formula means otherwise</em>.</Para>
            </Para>
        </SubSection>


            <SubSection helpId='control-properties'>
            <SubHeading>Properties</SubHeading>
            <Para>
                Every control has properties that affect how it looks and what it does.
                When you select a control in the Navigator by clicking on it, its properties appear in the Properties Panel.
            </Para>
            <Para>Each type of control has its own particular set of properties. Some properties, like Width or
                Font Size, are found on many types of control,
                but other properties are unique to one type of control.
            </Para>
            <Para>
                You can set what you want each property to be in the box beside the name.  The property value can be either a fixed value or a calculation - see Formulas.
            </Para>

            <Para>
                You don't have to set up every property.  Some properties will have a default value that is already entered for you, or they can just be left empty.
                You will only set these properties in a few cases when you have a particular need. It's a bit like formatting a paragraph in a word processor:
                there are all sorts of styles and things you can tweak, but most of the time you only need to change one or two of them and leave the rest alone.
            </Para>
            <Para>The help section for each control type describes all the properties and what you can do with them.</Para>
            <Para>
                As you change property values, you can see the effect immediately in the App Preview.  If you don't like what you see, just change it back or try something else.
            </Para>
            <Para>Property values that control the size of something on the screen are given in <b>pixels.</b>
                A pixel is one of the tiny dots that make up the screen display.
                A typical computer screen is 1920 pixels wide and 1080 high.  A normal character on the screen is between 10 and 20 pixels tall.</Para>
        </SubSection>
    </Section>
