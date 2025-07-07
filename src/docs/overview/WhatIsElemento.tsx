import React from 'react'
import {Heading, HelpLink, NamedList, NLItem, Para, Section, SubHeading, SubSection} from '../HelpComponents'

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

        <SubSection id='why-different'>
            <SubHeading>Why is Elemento different?</SubHeading>
            <Para>
                Low Code tools have been around for several years, so what makes Elemento different?  Here are some of the most important things:
            </Para>
            <NamedList>
                <NLItem name='Free or low cost to use'>
                    Designing apps with Elemento is totally free, and always will be.  So is running them for your own use, or a small number of users.
                    If you want to run a site that has thousands of users and lots of data, you will have to pay,
                    simply because no-one will give you the resources to do that for free.
                    But Elemento enables you to use low-cost cloud services such as Cloudflare with generous free allowances,
                    rather than being tied-in to an expensive subscription.
                </NLItem>

                <NLItem name='Your design, your data'>
                    There is no secretive central store - your design is stored on your computer, or on the widely-used GitHub system.
                    You can take the design, and the code Elemento generates to run it, and do what you want with it.
                    Any data stored by your app is also owned by you and totally under your control.
                </NLItem>

                <NLItem name='Open source'>
                    The designs and code to run Elemento itself are freely published for anyone to use.
                    So there is no question of your app becoming unusable if the provider of the tool goes out of business.
                    And if anyone wants to improve Elemento and run a better version of this site - that's completely fine!
                </NLItem>

                <NLItem name='Easy to learn and use'>
                    A lot of Low Code tools are not much easier to use than a conventional programming language.
                    Elemento is designed to be as straightforward as possible,
                    and we are building a wide range of resources to help you learn to use it quickly and painlessly.
                </NLItem>
            </NamedList>
        </SubSection>
    </Section>
