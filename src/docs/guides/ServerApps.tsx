import {BulletList, Heading, MinorHeading, NamedList, NLItem, Para, Section, SubHeading, SubSection} from '../HelpComponents'
import React from 'react'
import {Link} from '@mui/material'

export default () =>
    <Section id='server-apps-guide'>
        <Heading>Server Apps</Heading>
        <Para>
            The normal Apps that you create in Elemento run in the browser and display pages for people to view and interact with.
            But there is another important type - Server Apps - which run on a server on the internet.
            This guide explains what they are, why you may need them, and how to create and use them.
        </Para>

        <SubSection id='server-apps-what'>
            <SubHeading>What are Server Apps?</SubHeading>
            <Para>
                They are apps that have no visible elements, only things like Functions, Calculations and Data Stores.
                They run on a web server somewhere connected to the internet.
                The Functions they contain can be used by sending a request over the internet to the server.
                The request will usually come from one of your normal Apps running in a browser,
                but it could be from another program running anywhere, if you set the Function up to be used that way.
                The Function can do calculations with formulas, update Data Stores, and even make requests to services running on other web servers.
                It may send a response back over the internet with data that the other App or program is going to display.
            </Para>
            <Para>Server Apps are easy to write in Elemento - actually easier than normal Apps,
                because you only have to think about calculating the answers - there are no visible elements to worry about.
            </Para>
            <Para>
                Elemento provides an easy way for you to make a Server App available on the internet, using the Google Firebase cloud service.
                But if you are an experienced developer, it is also easy to set up your own deployment arrangements for hosting the generated code anywhere you like.
            </Para>
        </SubSection>

        <SubSection id='server-apps-why'>
            <SubHeading>Why do we need Server Apps?</SubHeading>
            <Para>
                The main reasons why you may need a server app are:
            </Para>
            <NamedList>
                <NLItem name='Secure Updates'>
                    If you want rules to ensure only allowed updates are made to Data Stores, you can't do the updates directly from the browser.
                    It only needs a small amount of technical knowledge to alter internet requests going out from a browser,
                    so a malicious user could do things in your data that they shouldn't.
                    A Server App can reject any illegal requests before the Data Store is accessed, without any possibility of interference,
                    because it is running on a secure server.
                </NLItem>
                <NLItem name='Secret information'>
                    If you want to connect to other internet services (APIs) for things like payments or sending email,
                    you usually need to have a secret key to prove you have access.  You can't put this key in an App running on the browser,
                    because it would only need a little technical knowledge to find the key,
                    and then someone could get access to the service pretending to be you, and do whatever they liked with it.
                    A Server App can store the secrets securely and pass on requests to the services after checking them.
                </NLItem>
                <NLItem name='Providing an internet service'>
                    You many want your system to provide internet services so that other programs (that you or other people have created)
                    can connect directly and call Functions to do things.  This is often called providing an API (Application Programming Interface).
                    To do this, those Functions need to run on a server connected to the internet.
                    A Server App can be set up to allow requests from third parties, with authorisation where necessary.
                </NLItem>
            </NamedList>

        </SubSection>

        <SubSection id='server-apps-what-can-do'>
            <SubHeading>Uses of Server Apps</SubHeading>
            <Para>
                Here are some examples of cases where you would need a server app.
                They are the kind of thing you would find in a system that took online orders and payments.
            </Para>
            <NamedList>
                <NLItem name='Ensuring valid updates to data'>
                    If you have a business system with reasonably complex data, you will usually have rules about what is allowed in the data.
                    For example, your apps may enforce a rule that new customers cannot have a Credit Limit greater than 500.
                    If the normal App in the browser could update the database directly,
                    someone could easily alter the data as it was sent out to make the credit limit anything they wanted.
                    If instead the App in the browser asks a Server App to update the database, the Server App checks the data,
                    and there is no way anyone can interfere with that.
                </NLItem>
                <NLItem name='Secret information'>
                    If you want to use a payment service like Stripe, you will get a secret access key from them.
                    You would set up your browser App to make a request to a Server App that deals with payments.
                    The Server App stores the key securely and supplies it to Stripe when necessary.
                </NLItem>
                <NLItem name='Providing an internet service'>
                    Some systems allow orders to be sent directly from another system, instead of being entered through a browser.
                    A Server App in Elemento can be set up to do this.
                </NLItem>
            </NamedList>
        </SubSection>

        <SubSection id='server-apps-what-you-need'>
            <SubHeading>What you need to use Server Apps</SubHeading>
            <Para>
                A Server App needs to run on a server connected to the internet.
                There are many ways to do this, and if you are an experienced developer you can choose any way you like to
                run the Server App code that Elemento generates.  But for those without the knowledge to do that,
                Elemento provides easy-to-use tools which let you
                set up the Google Firebase cloud service to host your Project and run your Server Apps.
                See the Firebase Hosting guide for details.
            </Para>
            <Para>
                Once you have developed and tested your Project with Server Apps, and each time you have changes that you want to release,
                you will need to deploy your Project to Firebase Hosting.  See the Firebase Hosting guide, Deployment section.
            </Para>
        </SubSection>

        <SubSection id='server-apps-how-to-create'>
            <SubHeading>How to create a Server App</SubHeading>
            <Para>
                First of all, add a Server App to your project.
                In the Studio, click on the Project - the top item in the Navigator.
                Then click the Insert menu at the top, then Inside, then Server App.  You may want to change the name to something that describes the purpose of the Server App.
            </Para>

            <MinorHeading>Add Functions</MinorHeading>
            <Para>
                Now you need to add one or more Functions to the Server App, to make it do something useful.
                These can be Calculation Functions which just look up data and give you an answer, or Action Functions, which update data.
                It is important to choose the right type, as Calculation Functions are called automatically by the Elemento framework, as many times as needed,
                but Action Functions should only be called when the user has specifically asked for that action to take place.
                For more details about Functions, see the Elemento Help.
            </Para>
            <Para>To add a Function, select the Server App in the Navigator, then click Insert Menu, Inside, Function.</Para>

            <MinorHeading>Data Storage</MinorHeading>
            <Para>
                The Functions may need to use Collections and Data Stores.  These are set up and used in the same way as in a browser App.
            </Para>
            <Para>To add a Collections or Data Store, select the Server App in the Navigator, then click Insert Menu, Inside, followed by Collection or Data Store.</Para>
        </SubSection>

        <SubSection id='server-apps-connect-from-browser'>
            <SubHeading>Connecting to a Server App from the browser</SubHeading>
            <Para>
                Once you have some Functions in your Server App, you can use them in a browser App almost as if they were Functions in the Browser App itself.
                The browser App will connect to the Server App when needed to call the Functions
                to do this, you need to add a Server App Connector in the browser App.
            </Para>
            <Para>
                First select the browser App in the Navigator, then click Insert Menu, Inside, Server App Connector.
                You may want to change the name to be the same as the Server App.
                In the Server App property, enter the formula name (no spaces) of the Server App you want to connect to.
            </Para>

            <MinorHeading>Using Server App functions</MinorHeading>
            <Para>
                To use a Server App function in a formula, Enter the formula name of the Server App Connector,
                a period and the formula name of the Function in the Server App, followed by the brackets and inputs.
            </Para>
            <Para>For example, if you have:</Para>
            <BulletList>
                <li>A Server App called Price Server</li>
                <li>A Function in the Server App called Discounted Price, with two inputs for the price and discount type</li>
                <li>A Server App Connector called Special Pricing that connects to Price Server</li>
            </BulletList>
            <Para>then you might write something like:  SpecialPricing.DiscountedPrice(20.50, "SpringSale")</Para>
        </SubSection>

        <SubSection id='server-apps-developer-info'>
            <SubHeading>Information for experienced developers</SubHeading>
            <Para>
                If you are familiar with developing JavaScript backends, this section explains how the server-side code generated by Elemento works,
                and what you would need to deploy it in your own environment.
            </Para>
            <Para>
                For each Project with Server Apps, Elemento generates code into the dist/server directory.  There is one file for each Server App,
                named after the formula name of the Server App, with a .mjs extension, as it uses ESM imports.
            </Para>

            <Para>There is also a file called ExpressApp.js that creates a standard Express app to run the Server Apps.
                It imports the Elemento server runtime library from serverRuntime.cjs in the same directory.  This file is available from
                https://elemento.online/lib/serverRuntime.cjs.</Para>
            <Para>
                The generated index.js and package.json are intended for running with Firebase, so you would probably need to replace them
                with files suitable for your hosting environment.
            </Para>

        </SubSection>

    </Section>