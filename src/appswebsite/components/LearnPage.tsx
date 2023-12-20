import React from 'react'
import {Box, Link, Typography} from '@mui/material'
import AppBar from '../../appsShared/AppBar'
import {theme} from '../../appsShared/styling'
import {ThemeProvider} from '@mui/material/styles'

const Para = ({children, ...props}: any) => <Typography variant={'body1'} fontSize='1.1em' mt={2} marginBottom='1.25em' {...props}>{children}</Typography>
export const Heading = ({children}: {children: any }) => <Typography variant="h1" fontSize='2rem' mt='2.5rem' mb='2rem' color='#0F172A'>{children}</Typography>
export const SubHeading = ({children}: {children: any }) => <Typography variant="h2" fontSize='1.5rem' mt='2rem' mb='1.5rem' color='#0F172A'>{children}</Typography>
export const MinorHeading = ({id, children}: {id?: string, children: any }) => <Typography variant="h3" id={id} fontSize='1.2rem' mt='1.5rem' mb='1rem' color='#0F172A'>{children}</Typography>


export default function LearnPage() {

    return <ThemeProvider theme={theme}>
        <Box display='flex' flexDirection='column' height='100%' width='100%'>
            <Box flex='0'>
                <AppBar title='Learning Elemento' userMenu={false}/>
            </Box>
            <Box flex='1' minHeight={0} p={3} maxWidth='50em' overflow='auto' boxSizing='border-box' pl={10}>
                <Heading>Learning to use Elemento</Heading>
                <Para>
                    We're creating a wide range of resources to help you learn quickly and easily.
                    The first few essentials are available now, and much more will be appearing soon.
                </Para>

                <SubHeading>Tutorials</SubHeading>
                <Para>These take you step-by-step through creating a simple app, or learning a particular skill.</Para>
                <Para><Link href='/studio/?openFromGitHub=https://github.com/ElementoResources/your-first-app-tutorial'>Your first Elemento App</Link></Para>

                <SubHeading>Example apps</SubHeading>
                <Para>These show you different types of app, with a built-in tour to show you the interesting points.
                    You will get more out of these if you know the basics of Elemento first.</Para>
                <Para><Link href='/studio/?openFromGitHub=https://github.com/ElementoResources/customer-database-example'>Customer Database Example</Link></Para>

                <SubHeading>Elemento Help</SubHeading>
                <Para>This is the instruction manual that explains everything about Elemento.
                    Like most instruction books, it tells you what you need to know clearly and concisely, without lots of background explanation.
                If you like reading manuals, it could be a quick way to learn, but most people will just dip into it when they need to.</Para>
                <Para>You can also show the Help at any time inside the Elemento Studio.</Para>
                <Para><Link href='/help'>Go to Elemento Help</Link></Para>

                <SubHeading>How to get started</SubHeading>
                <Para>
                    Elemento is designed to be as easy to use as possible, but it is also a powerful tool with lots of features.
                    You only need to know a few things to get started,
                    but most people are going to need a little help to take the first steps and then make the most of the possibilities it offers.
                </Para>

                <Para>
                    Everyone will be starting from a different level of programming knowledge (don't worry if that's zero for you - you can still learn to use Elemento!).
                    Everyone will want to do different things with Elemento, and everyone prefers to learn in a different way.
                    So use these resources in whatever way works best for you.
                </Para>

                <Para>
                    If you are completely new to programming, you could start with <b>Your first Elemento app</b> in the Tutorials section.
                    Or if you are a programmer, or have used a low code tool before, you could skim through the Help and then experiment with one of the Example Apps.
                </Para>

            </Box>
        </Box>
    </ThemeProvider>
}
