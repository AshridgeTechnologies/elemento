import React from 'react'
import {
    BulletList,
    Heading,
    MinorHeading,
    NamedList, NLItem,
    Para,
    Section,
    SubHeading,
    SubSection,
    Summary
} from '../HelpComponents'

export default () =>
    <Section id='data-types-guide'>
        <Heading>Data Types</Heading>
        <Para>
            Programming is all about storing pieces of data and doing calculations with them.
            But what exactly are these "pieces of data", and what do you need to know about them to use them?
            This section explains the different types of data in detail.
            You may want to read through it to understand the subject thoroughly, or just dip into it when you need to know something.
        </Para>

        <SubSection id='data-types-why'>
            <SubHeading>Why do I need to worry about this?</SubHeading>
            <Para>
                Because the type of data you are dealing with decides what you use it for and what you can do with it.
                For example if you have a number, like 23, you can add, multiply, subtract, and many other operations.
                Or if you have the first name "Jane", which is text, you could take the first letter to use as an initial,
                or join it with a surname to get the person's full name.
            </Para>
            <Para>But it would make no sense to multiply "Jane" by 10, or to get the square root of "Jones".
            So when you choose the types of data items you will store in a program, you need to use the appropriate ones.
            As a simple example, suppose you were keeping records of people in your sports club.  Their name would need to be text,
            and their membership fee would need to be a number.</Para>
        </SubSection>

        <SubSection id='simple-data-types'>
            <SubHeading>Simple Data Types</SubHeading>
            <Para>There are a few basic data types used in programming that you need to know about.</Para>

            <MinorHeading>Text</MinorHeading>
            <Para>Data that is a mixture of letters, digits and other characters.  To write a fixed text value in a formula, you put quotes around it.  Some examples:</Para>
            <BulletList>
                <li>"Nelson"</li>
                <li>"ABC123"</li>
                <li>"Jon! How did you get here?"</li>
            </BulletList>
            <Para>Text items are used for things like names, place names, descriptions or reference codes.</Para>

            <MinorHeading>Number</MinorHeading>
            <Para>Data that represents a number.  To write a fixed text value in a formula, you write it as you would normally write any number.  Some examples:</Para>
            <BulletList>
                <li>10</li>
                <li>10.735</li>
                <li>-0.25</li>
            </BulletList>
            <Para>Numbers are used for things like amounts or measurements.</Para>

            <Para><em>Warning - numbers that are not numbers</em></Para>
            <Para>Many things that are called numbers are really text.  They are usually reference codes to identify something.
                If you look at many Membership Numbers, Part Numbers, Model Numbers, Account Numbers, etc they will be a mixture of digits, letters and other characters.
                Even if they are all digits, like a bank account number, it is usually better to store them as text.
                You are never going to do arithmetic with a bank account number.
            </Para>
        </SubSection>

        <Para>To be continued...</Para>
    </Section>
