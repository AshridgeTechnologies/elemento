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

        <SubSection id='server-apps-what-you-need'>
            <SubHeading>What you need to use Server Apps</SubHeading>
            <Para>
                There are a few straightforward things you need to do to prepare to use Server Apps.
                As Elemento is provided as a free service, it is not possible to include the cloud services needed as part of the package.
                So instead we make it easy to run your apps on Google Firebase, an easy to use cloud hosting service.
                You will need to create your own account with Google, and arrange to pay for any charges you incur,
                and then follow a few instructions to set things up.
            </Para>
            <Para>
                The good news is that the costs will usually be lower than other low code/no code services,
                and for many small sites with low visitor numbers it will be free, as Google gives you a generous free allowance.
                And if you do get a sudden spike of traffic to your site, Google automatically scales up the number of servers allocated to you to meet the demand,
                so you don't need to worry about your site collapsing under the pressure.
            </Para>
            <NamedList>
                <NLItem name='Set up a Google account'>
                    Many people already have a Google account for using Gmail and other services.
                    You could use this, but you may prefer to set up a separate one for running your Elemento apps.
                    Go to this page <Link href='https://support.google.com/accounts/answer/27441?hl=en'>Create a Google Account</Link> and follow the instructions.
                </NLItem>
                <NLItem name='Create a Firebase project'>
                    Go to the <Link href='https://firebase.google.com'>Firebase home page</Link>.
                    Have a look around if you are curious, and when you are ready, click the Get Started button.
                    Click the account button in the top right corner to check you are using the right account, and change it if not.
                    then click the Add project link
                </NLItem>
                <NLItem name='Enter the project name'>
                    You probably want your project name to reflect what your app is about, so if you already have a name for your app (like Ballpoint Pen World),
                    use that name here. This name may appear to users of your app occasionally, so make it sensible.
                    You will see another name below it, in lower case with hyphens, based on your main name (eg "ballpoint-pen-world").
                    This is an id for your project that will be used in the URLs for your app website, so you will want to choose a clear id that reflacts your app name.
                    It has to be unique across all the projects in Firebase, so the most obvious one may have been taken.
                    If the one suggested looks a bit odd, click on it and try different names until you find one that is OK.  When you are happy, click Continue.
                </NLItem>
                <NLItem name='Upgrade to a paid account'>
                    This doesn't commit you to any regular monthly payment - you pay only for the computer time and resources that your site needs,
                    and you will be probably stay within the free allowance until you get a reasonable volume of visitors.
                    But you have to set up a payment method so that Google can charge you if necessary.  Click the button that says "Spark Plan" next
                    to the project name, Select the Blaze plan, and follow the instructions to set up a billing account.
                </NLItem>
                <NLItem name='Set up Firebase Services'>
                    Go to the <Link href='https://console.firebase.google.com/u/0/project/_/storage'>Firebase console Storage page</Link>, and select your project.
                    Click the Get Started button.  Make sure the Start in production mode button is selected, then click Next.
                    On the next step, select the Cloud Storage location europe-west2, then click Done and wait for it to finish working.
                </NLItem>
                <NLItem name='Install the Elemento extension'>
                    Go to the <Link href='https://console.firebase.google.com/u/0/project/_/extensions'>Firebase console Extensions page</Link>, and select your project.
                    Next steps TBC
                </NLItem>
            </NamedList>
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
                <li>A Function in the Server App called Discounted Price</li>
                <li>A Server App Connector called Special Pricing that connects to Price Server</li>
                <li>And inputs called Full Price and Discount Type</li>
            </BulletList>
            <Para>then you would write:  SpecialPricing.DiscountedPrice(FullPrice, DiscountType)</Para>
        </SubSection>

    </Section>