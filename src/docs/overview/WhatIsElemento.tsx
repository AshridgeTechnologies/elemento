import React from 'react'
import {Heading, HelpLink, Para, Section} from '../HelpComponents'

export default () =>
    <Section id='what-is-elemento'>
        <Heading>What is Elemento?</Heading>
        <Para>
            Elemento is a <b>Low Code programming tool</b>.
            It lets people with no programming experience create software apps for business, education, games - or lots
            of other things.
            An app could be as simple as a 10-question quiz, or a complex system to run a whole business.
        </Para>
        <Para>You can use just the apps you create yourself, or you can easily publish them on the internet for others to use.
        </Para>
        <Para>
            You create your apps by choosing the parts you need from menus and filling in forms.
            The parts are connected together with small snippets of code called <b><HelpLink id='formulas'/></b>.
            These are quite similar to spreadsheet formulas, but even easier to understand.
            They use names that you have given to other things in the app, like <code>FirstName</code>, instead of cell
            locations like <code>C2</code>.
        </Para>
        <Para>
            For example, if you are calculating the final total of a sales invoice, you might write a formula like this:<br/>
            <code>Sum(LineItemTotals) + Delivery + Tax</code>
        </Para>
    </Section>
