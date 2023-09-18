import React from 'react'
import {TextField} from '@mui/material'
import {BulletList, Heading, MinorHeading, NumberedList, Para, Section, SubHeading, SubSection} from '../HelpComponents'

export default () =>
    <Section id='formulas'>
        <Heading>Formulas</Heading>
        <Para>
            Formulas are short snippets of code that tell your app what to do.  They can calculate values, or perform actions.
            They look rather like the formulas in cells of a spreadsheet.
            They also act in a similar way - as a value changes in one part of the app, any formulas that use it automatically update their result.
        </Para>
        <Para>
            Here are some examples (we will explain what they mean below):
        </Para>
        <BulletList>
            <li>Length + 10</li>
            <li>"Hello, " + Name</li>
            <li>Sum(ItemTotal, Delivery, ExtraChargeForOrdersOnTuesday)</li>
            <li>Save(OrderData, CurrentOrderFile)</li>
        </BulletList>

        <MinorHeading>Names in formulas</MinorHeading>
        <Para>
            The names in these examples, like <code>Length</code> or <code>ItemTotal</code> are the names of elements in the app.
            The app uses the current value of the element in the formula.
        </Para>
        <Para>So if you had a Text Input element where someone could enter their name, and you gave it the name "First Name",
            you can use <code>FirstName</code> in a formula to get the current value of the element - what the user has entered as their first name.</Para>
        <Para><em>Note:</em> you will see that although you called the element "First Name", in the formula you write <code>FirstName</code> - just miss out the spaces.
        </Para>

        <MinorHeading>Fixed values in formulas</MinorHeading>
        <Para>
            As well as using the current value of an element, you can use fixed values, like <code>10</code> or <code>"Hello "</code> in the examples above.
        </Para>
        <Para>
            Some things to know about writing fixed values:
        </Para>
        <BulletList>
            <li><b>Text values</b> need to have quotes around them eg <code>"Hello "</code></li>
            <li><b>Numbers</b> are written just as you normally would eg <code>10</code></li>
        </BulletList>

        <MinorHeading>Where you use formulas</MinorHeading>
        <Para>
            You enter a formula in a property of an element.
            Take this example from a Hello World app, where we want to set the content of a Text element to a formula
            that joins together the word "Hello, " and the current value of a Text Input called Name.
        </Para>
        <TextField label="Content" variant='outlined' size='small' value={'"Hello, " + Name'}/>
        <Para>
            This sets the Content property of a Text element
        </Para>


        <MinorHeading>Kinds of formulas</MinorHeading>
        <Para>There are two kinds of formulas:</Para>
        <BulletList>
            <li>Calculations - these work out values, but don't change anything</li>
            <li>Actions - these make something happen, but they don't produce a value</li>
        </BulletList>

        <SubSection id='calculation-formulas'>
            <SubHeading>Calculation Formulas</SubHeading>
            <Para>
                Most formulas are calculations.  They are used to work out the values of an element's properties.
                Each time something in the app changes, they are recalculated automatically to update the value, like cells in a spreadsheet.
            </Para>
            <Para>
                There are two basic types of calculation, simple and functions.  You can also mix these types together.
            </Para>

            <MinorHeading>Simple calculations</MinorHeading>
            <Para>These are like the basic maths expressions you learned at school, and they follow the same rules. Some things to look out for:</Para>
            <BulletList>
                <li>You use * instead of x to multiply values, to avoid confusion with something called "x"</li>
                <li>Multiplication and division are done before addition and subtraction, so you may need brackets.</li>
                <li>You can also use + to join text with another value</li>
            </BulletList>
            <Para>Here are some examples, with the steps you would take to work them out on a calculator:</Para>
            <BulletList>
                <li>Height - 10<br/>
                Take the value of Height, subtract 10
                </li>
                <li>Oranges + Apples / 100<br/>
                Take the value of Apples, divide it by 100, add the value of Oranges
                </li>
                <li>(Oranges + Apples) * 0.5<br/>
                Take the value of Oranges, add the value of Apples, multiply by 0.5
                </li>
                <li>"Hello " + FirstName<br/>
                If the value of FirstName was "Jeremiah", the result would be "Hello Jeremiah"
                </li>
                <li>"You owe £" + Amount + " which must be paid today"<br/>
                If the value of Amount was 10, the result would be "You owe £10 which must be paid today"
                </li>
            </BulletList>

            <MinorHeading>Functions</MinorHeading>
            <Para>These are like the functions you use in spreadsheet formulas.
                There are many different ones to do various sorts of calculation, including:
            </Para>
            <BulletList>
                <li>maths calculations, such as adding up a list of numbers (Sum), or finding the largest of a set of numbers (Max)</li>
                <li>working with text, such as converting all the characters to capitals (UpperCase)</li>
                <li>making decisions, such as choosing between two different calculations (If)</li>
            </BulletList>
            <Para>
                A function will usually need one or more inputs - values to do the calculation with.
                To use a function, you type:</Para>
            <NumberedList>
                <li>The name of the function, eg <code>Sum</code></li>
                <li>a left bracket (</li>
                <li>the values going into the function, separated by commas eg <i>Goods, Delivery, Tax</i></li>
                <li>a right bracket )</li>
            </NumberedList>



            <Para>Here are some examples, with a short explanation of what they do:</Para>
            <BulletList>
                <li>Sum(Goods, Delivery, Tax)<br/>
                Add up the values of goods, delivery and tax
                </li>
                <li>UpperCase("blue")<br/>
                Change the letters of the input text to "BLUE"
                </li>
                <li>If( Today = "Tuesday", Goods + Delivery + TuesdayTax, Goods + Delivery)<br/>
                If today is Tuesday, add an extra amount, otherwise use the normal amount
                </li>
            </BulletList>
            <Para>Some functions are Action functions, which are used to update things or make something happen, and they cannot be used in calculations.
                The Reference section for a function tells you whether it is a Calculation function or an Action function.</Para>

            <MinorHeading>Mix and Match</MinorHeading>
            <Para>A value in a formula does not have to be a fixed value or an element value.  It can be the result of another formula.  Here are some examples:
            </Para>
            <BulletList>
                <li>"The total is £" + Sum(Goods, Delivery, Tax)</li>
                <li>Sum(Goods, Delivery, If( Today = "Tuesday", TuesdayTax, 0))</li>
                <li>"Hello " + UpperCase(FirstName + " " + LastName)</li>
            </BulletList>
        </SubSection>

        <SubSection id='action-formulas'>
            <SubHeading>Action Formulas</SubHeading>
            <Para>
                Action formulas change something or make something happen, such as:
            </Para>
            <BulletList>
                <li>setting a value in the app</li>
                <li>saving data to a file or a database</li>
                <li>displaying an alert on the screen</li>
            </BulletList>
            <Para>Action formulas must contain an Action Function. These are special functions that make something happen.
                They do not produce any result value, so they cannot be used as values in other formulas.
                The action only happens once when it is triggered - it is not continuously updated like a calculation formula.</Para>

            <MinorHeading>Where action formulas are used</MinorHeading>
            <Para>There are some properties of elements that need an action formula instead of a calculation.
                The reference section for that element tells you which they are.</Para>
            <Para>For example, a Button element has an <code>Action</code> property.
                When the user clicks the button on the page, the formula in the Action property runs.
                A button to save the data entered on a page might have an Action like this:</Para>
            <TextField label="Action" variant='filled' size='small' value={'Update(Orders, OrderId, OrderData)'} fullWidth/>

        </SubSection>



    </Section>
