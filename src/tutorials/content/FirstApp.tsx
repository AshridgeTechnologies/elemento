import React from 'react'
import {BulletList, Heading, Para, Section, SubHeading} from '../../docs/HelpComponents'

export default () =>
    <Section helpId='first-app'>
        <Heading >Creating your first app with Elemento</Heading>
        <Para>
            Congratulations on deciding to dive in!
        </Para>
        <Para>
            This short guide will take you step-by-step through creating a really simple Elemento app.  The app just asks for your name,
            and then displays "Hello, Daisy Mae" (or whatever you tell it you are called).
        </Para>

        <SubHeading>What you will need</SubHeading>
        <BulletList>
            <li>A laptop or desktop computer with a good size screen - Full HD (1920 x 1024) is best</li>
            <li>An up to date browser - Elemento works best with Chrome</li>
            <li>About 5 minutes to complete all the steps</li>
        </BulletList>

        <SubHeading>How to use this guide</SubHeading>
        <Para>
            To make it easier to work through the steps, this page displays the Elemento Studio in the panel to the right of this guide.
            All the rest of the steps here are things you do in that panel, which is just called "the studio".
        </Para>
        <Para>
            You can scroll down the guide in this column - the studio will stay in view.
        </Para>

        <Para>Let's get started...</Para>

        <SubHeading>Create a new project</SubHeading>
        <Para>Click on the <b>File</b> button in the top left of the studio, then in the menu that appears, click <b>New</b>.</Para>
        <Para>You should see the Welcome to Elemento app replaced by a new app with just a single empty page.</Para>

        <SubHeading>Add a title</SubHeading>
        <Para>Make sure you can see the Main Page item at the left side of the studio.  If not, click the + symbols until you find it.</Para>
        <Para>Right click on the Main Page item.  In the menu that appears, click <b>Insert inside</b>, and in the next menu click <b>Text</b>.</Para>
        <Para>You should see the words "Your text here" appear on the right of the studio panel.</Para>

        <SubHeading>Take a pause</SubHeading>
        <Para>Quite a few things will have appeared on the screen now, so let's just explain what you are seeing.</Para>
        <Para>There should be four columns showing:</Para>
        <BulletList>
            <li>This guide, on the left</li>
            <li>The Navigation panel, in the first column inside the studio panel</li>
            <li>The Properties panel, in the next column</li>
            <li>The App Preview, on the right of the studio panel</li>
        </BulletList>

        <SubHeading>Make it look like a title</SubHeading>
        <Para>In the Properties panel, find the box near the top with the title Content</Para>
        <Para>Clear the text in this box, and type in the title you want, something like "My Hello App"</Para>
        <Para>You should see your new title appear on the right.</Para>
        <Para>Now find the box a little further down with the title Font Size.  Type "32" in here.</Para>
        <Para>You should now see your title in large type on the right.</Para>

        <SubHeading>Add a box to enter your name</SubHeading>
        <Para>In the Navigation panel (at the left of the studio), right click on the Main Page item again.
            In the menu that appears, click "Insert inside", and in the next menu click "Text Input".</Para>
        <Para>You should see a box with "Text Input 1" appear in the App Preview.</Para>

        <SubHeading>Call the box something sensible</SubHeading>
        <Para>In the Properties panel, click in the box at the top that says "Text Input 1".
            Change this to be the word "Name" (without the quotes).</Para>
        <Para>The box in the App Preview should now say "Name" in it.</Para>

        <SubHeading>Add the Hello message</SubHeading>
        <Para>In the Navigation panel, right click on the Main Page item, click <b>Insert inside</b>, and in the next menu click <b>Text</b>.</Para>
        <Para>There will be another line in the App Preview that says "Your text here".</Para>

        <SubHeading>Set up the formula for the message</SubHeading>
        <Para>In the Properties panel, find the box near the top with the title Content.  Click the <b>ABC</b> button beside it.</Para>
        <Para>The button should change to say FX= (for a Formula), and an error message will appear -
            this is normal, because "Your text here" is not a correct formula.</Para>
        <Para>Clear the text in the Content box, and type in  <code>"Hello, " + Name</code>, including the quotes.
            There will still be error messages until you have completed the formula.</Para>

        <SubHeading>Try out your app</SubHeading>
        <Para>Type your name (or "Daisy Mae") in the Name box in the App Preview, and watch the message change.</Para>
        <Para>That's all you need to do - just tell Elemento how to work out your message from what you enter, and it does it automatically.</Para>

        <SubHeading>Save your app</SubHeading>
        <Para>You don't want to lose this masterpiece, so save it to a file on your computer.</Para>
        <Para>Click on the <b>File</b> button in the top left of the studio, then in the menu that appears, click <b>Save</b>.</Para>
        <Para>Then it's just like saving a file from any other program.
            Give the file a name and choose where to save it, then click the Save button below the file list when you are ready.
        </Para>

        <SubHeading>Publish your app (optional)</SubHeading>
        <Para>If you would like to show the world what you have created, let's get your app on the internet.  It takes less than a minute.</Para>
        <Para>Click Login at the top right of the Studio, and follow the instructions.  You can login with your Google account, if you have one,
        or create a new Elemento account with an email and password.</Para>
        <Para>When you are logged in, click on the <b>File</b> button at the top left of the studio, then click <b>Publish</b>.</Para>
        <Para>Click on the link in the message to run the app.  It will open in a new tab or window.</Para>
        <Para>You can also copy the link and share it with anyone you want.</Para>
        <Para><em>Please note:</em>  Apps published on Elemento are available to anyone if they have the link,
            so don't include any private information in an app until you have learned how to add security features.</Para>

        <SubHeading>Congratulations!</SubHeading>
        <Para>You have created your first app with Elemento, saved it so you can work on it again, and published it for you or anyone to use.</Para>
        <Para>When you are ready, check out the other tutorials to find out how to do much, much more with Elemento.</Para>

    </Section>
