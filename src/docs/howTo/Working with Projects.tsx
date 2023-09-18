import React from 'react'
import {BulletList, Heading, HelpLink, MinorHeading, Para, Section, SubHeading, SubSection} from '../HelpComponents'
import {Link} from '@mui/material'
import {ArrowCircleRightTwoTone as ArrowCircleIcon} from '@mui/icons-material'

export default () =>
    <Section id='working-with-projects'>
        <Heading>Working with Projects</Heading>

        <SubHeading>Introduction</SubHeading>
        <Para>This section aims to tell you everything you need to know to create, save and re-open Projects in the
            Elemento Studio,
            and also how to store them in GitHub (a widely-used system for storing program code) and publish them for
            others to use.
        </Para>

        <SubSection id='creating-new-project'>
            <SubHeading>Creating a new Project</SubHeading>
            <Para>A Project is stored as a set of files in a folder on your computer disk.
                When you create a new Project in Elemento Studio, it asks you to create this folder and give it
                permission to access the files in it.
                Here are the steps in detail:
            </Para>
            <BulletList>
                <li>Click the File menu button, then the New option</li>
                <li>In the <b>Create new project</b> box that appears, click the Choose button</li>
                <li>Use the file chooser to create a new folder on your computer for the project files, then click
                    Select
                </li>
                <li>When a box with "Let site edit files?" appears, give Elemento permission to access the folder by
                    clicking the Edit Files button
                </li>
                <li>Finally, click the Create button</li>
                <li>The main Studio page will show the new bare-bones project, with just one page and a title</li>
            </BulletList>
        </SubSection>

        <SubSection id='opening-project'>
            <SubHeading>Opening a Project on your computer</SubHeading>
            <Para>If you already have an Elemento project on your computer, which you have created or got from GitHub,
                you can go back to it.</Para>
            <BulletList>
                <li>Click the File menu button, then the Open option</li>
                <li>In the <b>Create new project</b> box that appears, click the Choose button</li>
                <li>Use the file chooser to find and click on the folder that contains the project files, then click
                    Select
                </li>
                <li>When a box with "Let site edit files?" appears, give Elemento permission to access the folder by
                    clicking the Edit Files button
                </li>
                <li>The main Studio page shows the project</li>
            </BulletList>
        </SubSection>

        <SubSection id='saving-copying-project'>
            <SubHeading>Saving or copying a Project on your computer</SubHeading>
            <Para>You don't need to do anything to save the Project - Elemento Studio updates the files immediately when
                you change something.</Para>
            <Para>If you want to copy the Project (maybe for backup, sharing or to use as a base for a new Project) or
                delete it, you don't need the Elemento Studio.
                Just use the normal File Explorer or Finder on your computer to do what you want with the folder.</Para>
        </SubSection>

        <SubSection id='introduction-github'>
            <SubHeading>Introduction to GitHub</SubHeading>
            <Para>GitHub is a website where you can store code and associated files used in software.
                It is owned by Microsoft, and used by millions of developers to store and manage their software. </Para>
            <Para>Storing a Project in GitHub is <b>completely optional</b>, but it ensures your project is safely
                backed up and allows you to publish it for others.</Para>
            <Para>Note that currently Elemento only works with public projects on GitHub, so anyone can look at it, and
                run it or download it.
                For many Projects this will not matter, but the ability to use private projects will be added to
                Elemento soon.</Para>
            <Para>
                You need to create an account to use it, but that is no more difficult than on any other website.
                A basic account is free, and lets you do most things you will want to do with Elemento.</Para>
            <Para>On the <Link href='https://github.com'>GitHub site</Link> you will find a huge number of options and
                tools, but you should not need them
                for most apps. Elemento Studio can talk directly to GitHub to do the three most important things:</Para>
            <BulletList>
                <li>Store a Project in GitHub, and update it when you change it</li>
                <li>Get a Project from GitHub</li>
                <li>Update a Project from GitHub if someone else has changed it</li>
            </BulletList>
        </SubSection>

        <SubSection id='creating-account-github'>
            <SubHeading>Creating a GitHub account</SubHeading>
            <Para>This has a couple of unusual steps, but it is very easy.</Para>
            <BulletList>
                <li>Go to the <Link href='https://github.com/signup' target='_blank'>GitHub signup page</Link></li>
                <li>Enter your email address and choose a password</li>
                <li>Choose a username. This has to be unique among everyone on GitHub. You can base it on your own name
                    or anything you like,
                    BUT it will form part of the web address for any apps you publish, so you may want to consider that
                    when choosing a good name.
                </li>
                <li>Choose whether to get lots of emails from them</li>
                <li>Now a rather quirky step - verify you are a real person by solving an easy puzzle</li>
                <li>Finally, click the Create account button</li>
            </BulletList>
            <Para>You will be taken to your GitHub home page, which may seem quite strange if you are not a programmer.
                Don't worry - come back to it when you have saved your first Project, and it may make more sense.
                You can do everything you need to do from within Elemento, so you don't actually need to use the GitHub
                site anyway.
            </Para>
        </SubSection>

        <SubSection id='signin-github'>
            <SubHeading>Signing into GitHub in Elemento</SubHeading>
            <Para>Now that you have a GitHub account, you have to connect Elemento to it.</Para>
            <BulletList>
                <li>Click the Sign In button at the top right of the studio, then click "Sign in with GitHub"</li>
                <li>If you have not already signed in to GitHub, you will be asked to sign in now with the email address
                    and password
                </li>
                <li>The Sign In button changes to a user symbol - click it to confirm you are signed in, or to sign out
                    again
                </li>
            </BulletList>
        </SubSection>

        <SubSection id='storing-github'>
            <SubHeading>Storing a Project in GitHub</SubHeading>
            <Para>If you have a Project on your computer, and you want to store it in GitHub for the first time,
                you will have to create a storage area in GitHub called a <em>repository</em>. Elemento will do that for
                you.
                Here are the steps: </Para>
            <BulletList>
                <li><HelpLink id='creating-account-github'>Create a GitHub account</HelpLink>
                    and <HelpLink id='signin-github'>Sign In</HelpLink> (if you haven't already)
                </li>
                <li>Click the File menu button, then Save to GitHub</li>
                <li>In the <b>Create GitHub repository</b> box that appears, enter a name.
                    The name of the Project folder is already filled in, but you can change it if you want.
                </li>
                <li>Click Create</li>
                <li>In the <b>Save to GitHub</b> box that appears next, enter a brief description of what you have done
                    so far,
                    or maybe just "First version" if you can't think of anything else.
                </li>
                <li>Click the Save button - saving will take a few seconds.</li>
                <li>If everything is OK, you will see the message "Saved to GitHub"</li>
            </BulletList>

            <MinorHeading>Updating the Project in GitHub</MinorHeading>
            <Para>When you have made changes to the Project, you can update it in GitHub in the same way, except you
                don't have to create the repository.</Para>
            <BulletList>
                <li>Click the File menu button, then Save to GitHub</li>
                <li>In the <b>Save to GitHub</b> box, enter a brief description of the changes you have made.</li>
                <li>Click the Save button - saving will take a few seconds.</li>
                <li>If everything is OK, you will see the message "Saved to GitHub"</li>
            </BulletList>

        </SubSection>

        <SubSection id='getting-from-github'>
            <SubHeading>Getting a Project from GitHub</SubHeading>
            <Para>If you want to look at or work on someone else's (public) Project, or work on your own Project on
                another computer,
                you will need to download it to a folder. So it's like creating a new project and then immediately
                filling it with a Project from GitHub.
            </Para>
            <Para>You will need the GitHub URL of the repository where the project is stored.
                This will look something like <code>https://github.com/username/repository-name</code>. Here are the
                steps:</Para>
            <BulletList>
                <li>Click the File menu button, then the Get from GitHub option</li>
                <li>In the <b>Get project from GitHub</b> box that appears, paste or type the GitHub URL</li>
                <li>click the Choose button</li>
                <li>Use the file chooser to create a new folder on your computer for the project files, then click
                    Select
                </li>
                <li>When a box with "Let site edit files?" appears, give Elemento permission to access the folder by
                    clicking the Edit Files button
                </li>
                <li>Finally, click the Get button - downloading the Project will take a few seconds</li>
                <li>The main Studio page will show the Project</li>
            </BulletList>

        </SubSection>

        <SubSection id='updating-from-github'>
            <SubHeading>Updating a Project from GitHub</SubHeading>
            <Para>If you are the only one working on your Project, and you always work on the same computer, you will
                not need to do this.
                But if changes have been made elsewhere and saved to GitHub, you will need to update the copy you are
                working on.</Para>
            <BulletList>
                <li>Click the File menu button, then the Update from GitHub option</li>
                <li>A message will appear when the Project has been updated</li>
            </BulletList>
        </SubSection>

        <SubSection id='publishing-from-github'>
            <SubHeading>Publishing a Project from GitHub</SubHeading>
            <Para>This is the easy bit - if you have saved your Project to GitHub, you have published it!</Para>
            <Para>Elemento provides a way to run your app directly from GitHub.
                Just use the Run App from GitHub link in the Studio above the Preview.
                You can click on this to open the app in another window, or copy it to share the app with others.
            </Para>
            <Para>Elemento finds the latest version of your Project saved to GitHub automatically.</Para>
        </SubSection>

        <SubSection id='experienced-developers'>
            <SubHeading>For experienced developers</SubHeading>
            <Para>Elemento stores its code in disk files like most other editors and IDEs.
                So if you know what you are doing with Git and GitHub, you can use other tools to commit and fetch
                changes.
                This lets you take advantage of versioning, branches, merging and any other facilities you need.
            </Para>
            <Para>Note that Elemento generates code into the <code>dist</code> folder and commits it with the source
                files.
                This may change in the future, but it is currently the easiest way of ensuring up to date runnable code
                exists in the GitHub repo.
            </Para>
        </SubSection>

    </Section>
