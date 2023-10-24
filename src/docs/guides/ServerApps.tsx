import {BulletList, Heading, NamedList, NLItem, Para, Section, SubHeading, SubSection} from '../HelpComponents'
import React from 'react'

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
                    A Server App can reject any illegal requests before the Data Store is updated, without any possibility of interference,
                    because it is running on a secure server.
                </NLItem>
                <NLItem name='Secret information'>
                    If you want to connect to other internet services (APIs) for things like payments or sending email,
                    you usually need to have a secret key to prove you have access.  You can't put this key in an App running on the browser,
                    because it would only need a little technical knowledge to find the key,
                    and then someone could get access to the service pretending to be you, and cause whatever damage they liked.
                    A Server App can store the secrets securely and pass on requests to the services after checking them.
                </NLItem>
                <NLItem name='Providing an internet service'>
                    If you want your system to provide internet services so that other programs can connect directly and call Functions to do things (an API),
                    those Functions need to run on a server connected to the internet.
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

    </Section>