import React from 'react'
import {Heading, Para, Section} from '../HelpComponents'

export default () =>
    <Section helpId='what-is-elemento'>
        <Heading >What is Elemento?</Heading>
        <Para>
            Elemento is a <b>Low Code programming tool</b>.  
            It lets you create computer programs by choosing the parts you need from menus and filling in forms.
        </Para>
        <Para>
            You connect the components together with small snippets of code called <b>formulas</b>.
            These are quite similar to spreadsheet formulas, but even easier to understand.  
            They use names that you have given to other things in the app, like <code>FirstName</code>, instead of cell locations like <code>C2</code>.
        </Para>
        <Para>
            For example, if you are calculating the final total of a sales invoice, you might write a formula like this:<br/>
            <code>sum(LineItemTotals) + Delivery + Tax</code>
        </Para>
    </Section>
