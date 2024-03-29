import {Heading, Para, SubHeading, Section, SubSection, MinorHeading, BulletList, NamedList, NLItem, HelpLink} from '../HelpComponents'
import React from 'react'
import {Link} from '@mui/material'

export default () =>
    <Section id='firebase-hosting-guide'>
        <Heading>Firebase Hosting</Heading>
        <Para>
            For a lot of simple Apps, you can either just run them on your own computer, or from the GitHub repository where they are stored,
            using the Elemento app runner.  This is easy and free, but some of the things you can do with Elemento need a more robust way of
            serving your App.  We provide tools to make it easy for you to use the Google Firebase cloud service,
            as this is probably the best option for most Elemento users.
            But if you are a developer, or can get one to help you, you can use the code generated by Elemento to run your app on any
            web hosting service you choose.
        </Para>

        <SubSection id='firebase-what'>
            <SubHeading>What is Firebase?</SubHeading>
            <Para>
                Google Firebase is a cloud hosting service for running apps on the internet.  It is aimed at experienced developers,
                but Elemento provides very easy to use tools to help you.
            </Para>
            <Para>
                Among the advantages of Firebase are:
            </Para>
            <BulletList>
                <li>Easier to use than the main competitors (Amazon Web Services, and Microsoft Azure)</li>
                <li>No fixed costs - you only pay for what you use</li>
                <li>A generous free allowance</li>
                <li>Automatic scaling - if you get a sudden spike of traffic to your site,
                    Firebase automatically increases the number of servers allocated to you to meet the demand,
                    so you don't need to worry about your site collapsing under the pressure</li>
            </BulletList>

            <MinorHeading>How do I use it?</MinorHeading>
            <Para>
                You will need to create your own account with Google, and arrange to pay for any charges you incur,
                and then follow a few instructions to get started.
                But most of the difficult work is done automatically by Elemento's Firebase Tool.
            </Para>
        </SubSection>

        <SubSection id='firebase-payment'>
            <SubHeading>Do I need to pay for it?</SubHeading>
            <Para>
                Probably - simply because the computers and networks needed to run apps on the internet cost a lot of money,
                and no-one can give you unlimited access to them for nothing.
                As Elemento is provided free (unlike nearly every other low-code tool),
                we have no subscription revenue to pay for these services on your behalf.
                To provide the Elemento Studio development tools,
                we rely on free services provided by large companies because they want to help developers or promote their other products.
            </Para>

            <MinorHeading>How much does it cost?</MinorHeading>
            <Para>
                This is a bit like answering the question "How much does an electricity supply cost?".
                The answer depends entirely on what you do with it and how much you use - or rather how much your users use when accessing your app.
                If you have lots of users, and your apps store and send out lots of data to every user, and do lots of calculations,
                the costs will rise.
            </Para>
            <Para>
                The good news is that the costs will usually be lower than other low code/no code services,
                and for many small sites with low visitor numbers it will be free, as Google gives you a generous free allowance.
            </Para>
            <Para>
                Even if you go beyond the free allowance, $10-$100 per month will cover quite a lot of Firebase usage and a large number of users.
                If the costs go higher, it would probably be worth working with a professional developer to look at other ways of
                running your app.
                But if your app is that successful, hopefully you will be earning enough to make this worthwhile!
            </Para>
        </SubSection>

        <SubSection id='firebase-why-needed'>
            <SubHeading>Why do I need Firebase?</SubHeading>
            <Para>
                Maybe you don't.  If you have created an App that does not need any of the services you get with Firebase, you will
                probably be fine running it either on your own computer or from GitHub.
                But here are some of the reasons you would want to use Firebase (or another hosting service):
            </Para>

            <NamedList>
                <NLItem name='Custom domain'>If you want your app to have its own domain name instead of an address starting with elemento.online, Firebase
                    lets you easily connect a custom domain to its hosting service
                </NLItem>
                <NLItem name='Server apps'>If your Project includes Server Apps, these will need to run on a proper hosting service
                </NLItem>
                <NLItem name='Firestore'>If your Project uses a Firestore Data Store, this requires Firebase
                </NLItem>
                <NLItem name='Faster hosting'>
                    Firebase uses caching and other techniques to make your app, and especially large files like images, load more quickly
                </NLItem>
            </NamedList>
        </SubSection>

        <SubSection id='firebase-project-setup'>
            <SubHeading>Setting up Firebase for your project</SubHeading>
            <Para>To use Firebase, you will need to set up a Firebase Project,
                connect your Elemento Project to it, and then install a Firebase extension in it.
                This is a piece of software, provided by Elemento, that runs inside Firebase and takes care of deploying (publishing) your Project
                and running your Server Apps when they are needed.  It also works with the Elemento Studio to run your Server Apps while
                you are developing them, so that the App Preview window can use them.
            </Para>
            <Para>Here are the steps you will need to set up your Elemento Project to use Firebase.</Para>
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
                    On the Google Analytics page, click Continue again, and then again when the project ready page appears.
                </NLItem>
                <NLItem name='Upgrade to a paid account'>
                    This doesn't commit you to any regular monthly payment - you pay only for the computer time and resources that your site needs,
                    and you will be probably stay within the free allowance until you get a reasonable volume of visitors.
                    But you have to set up a payment method so that Google can charge you if necessary.  Click the button that says "Spark Plan" next
                    to the project name, Select the Blaze plan, and follow the instructions to set up a billing account.
                    You may want to set a low budget amount, like $10/month, to start with.
                </NLItem>
                <NLItem name='Set up Firebase Services'>
                    Go to the <Link href='https://console.firebase.google.com/u/0/project/_/storage'>Firebase console Storage page</Link>, and select your project.
                    Click the Get Started button.  Make sure the Start in production mode button is selected, then click Next.
                    On the next step, select the Cloud Storage location europe-west2, then click Done and wait for it to finish working.
                </NLItem>
                <NLItem name='Install the Elemento extension'>
                    In the Elemento Studio, open your Elemento Project, then the Firebase Tool (Tools menu, then Firebase).
                    In the Setup section, enter the name of the Firebase Project you have created, and Save.
                    Then click the Install Elemento Extension link.
                    This will open a new tab showing the Firebase Console ready to install the extension
                    Follow the instructions there, and wait for the extension to install - this will take a few minutes.
                </NLItem>
            </NamedList>
        </SubSection>

        <SubSection id='firebase-deploy'>
            <SubHeading>Deploying your project to Firebase</SubHeading>
            <Para>When you have developed and tested your Project in the Elemento Studio, you will want to publish it for others to use
            by deploying it to Firebase.  You will do this again whenever you have built new features that you are ready to publish.
            </Para>

            <Para>First you will need to <HelpLink id='firebase-project-setup'>set up Firebase for your project</HelpLink>.
                Then, still using the Firebase Tool:
            </Para>
            <BulletList>
                <li>Scroll to the Deploy section</li>
                <li>Make sure that you are connected to the correct Google Account and GitHub account</li>
                <li>Make sure you have saved all the changes you want to deploy to GitHub</li>
                <li>Enter the URL of the GitHub repository that you want to deploy from</li>
                <li>Click Deploy and wait for it to finish (should be less than a minute)</li>
                <li>Try out your App(s) at the address shown</li>
            </BulletList>
        </SubSection>

    </Section>
