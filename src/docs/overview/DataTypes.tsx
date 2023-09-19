import React from 'react'
import {Heading, MinorHeading, NamedList, NLItem, Para, Section} from '../HelpComponents'

export default () =>
    <Section id='data-types'>
        <Heading>Data Types</Heading>
        <Para>You need to use a suitable data type for things that you store and do calculations with.
            Elemento has a number of built-in data types that are similar to those in most other programming systems.
            It also allows the developer to define further Project data types to define the exact rules of the data
            items it uses.
            These extend the built-in data types by adding more rules about the values that are allowed.
        </Para>

        <MinorHeading>Simple data types</MinorHeading>
        <NamedList>
            <NLItem name='text'>
                <Para>A mixture of letters, digits and other characters.
                    Used for names, descriptions, reference codes and many other things.
                    Written in double quotes eg "I am 82 years old - but I don't look it!"
                    Often called 'string' in other programming languages.
                </Para>
            </NLItem>

            <NLItem name='number'>
                <Para>A number such as a count, an amount or a measurement.
                    Includes both whole numbers and fractional numbers .
                    Written as you would normally write numbers eg 10, 100.0133 or -0.25.
                    Includes types that have names like integer or float in other languages.
                </Para>
            </NLItem>

            <NLItem name='decimal'>
                <Para>A number which needs to have a precise number of decimal places.
                    Used for things like money amounts where you do not want rounding errors in calculations.
                    Written in the form D`1200.00` or with the D() function.
                </Para>
            </NLItem>

            <NLItem name='true-false'>
                <Para>A data item which can have two values - <em>true</em> or <em>false</em>.
                    Used for facts that are either yes/no or on/off
                    Written with just the plain words <em>true</em> or <em>false</em>, always in lower case.
                    Usually called boolean in other languages.
                </Para>
            </NLItem>

            <NLItem name='choice'>
                <Para>A data item which can have one of a fairly small set of fixed values.
                    Used for things like days of the week, or countries of the world.
                    The values are written in quotes, like text values.
                    Similar to enum types in other languages.
                </Para>
            </NLItem>

            <NLItem name='date'>
                <Para>A date and time. To store a date without a time, a date set with the time set to midnight UTC/GMT
                    is used.
                    Used for things like date of birth, or appointment times.
                    The values are written using the DateVal() function.
                    Similar to date or date-time types in other languages.
                </Para>
            </NLItem>
        </NamedList>

        <MinorHeading id='structured-data-types'>Structured data types</MinorHeading>
        <NamedList>
            <NLItem name='list'>
                <Para>A collection of other data items, in a particular order, which can be accessed by their position
                    in the list.
                    Used for things like the places visited on a journey, or the steps in a recipe
                    Written with the List() function eg <code>List("Boil water", "Add sugar", "Mix thoroughly")</code>
                    May be called 'array' in other programming languages.
                </Para>
            </NLItem>
        </NamedList>

        <NamedList>
            <NLItem name='record'>
                <Para>A collection of named data items, representing different facts about something, which can be
                    accessed using the name.
                    Used for things like a Customer record in a database.
                    Written with the Record() function eg <code>Record("FirstName", "Jean", "LastName", "Durand",
                        "Region", "North")</code>
                    May be called 'record' or 'object' in other programming languages.
                </Para>
            </NLItem>
        </NamedList>

        <MinorHeading>Project data types</MinorHeading>
        <Para>These can be defined within a Data Types section under the Project.
            They are based on one of the built-in data types above, but add further rules about the data values allowed.
            The rules that can be added depend on the base data type.</Para>
        <Para>For example, a data type based on <code>text</code> can define the minimum and maximum length,
            or a data type based on <code>number</code> can define the minimum and maximum number values allowed.
        </Para>
        <Para>A data type based on <code>record</code> would have other data types inside it to specify the names and rules for the data items it
            contains.</Para>
        <Para>Project data types can be used to validate the data entered in form fields, and also to generate forms automatically.</Para>

    </Section>
