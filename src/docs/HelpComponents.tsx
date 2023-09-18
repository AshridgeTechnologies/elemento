import React, {ReactNode} from 'react'
import {Link, Typography} from '@mui/material'
import {startCase} from 'lodash'

const idIfPresent = (id?: string) => id ? {id} : {}
export const Section = ({id, children}: {id: string, children: any}) => <section id={id}>{children}</section>
export const Summary = ({id, children}: {id: string, children: any}) => <article id={id}>
        <MinorHeading>Summary</MinorHeading>
        {children}
</article>
export const SubSection = ({id, children}: {id: string, children: any}) => <article id={id}>{children}</article>
export const Heading = ({children}: {children: any }) => <Typography variant="h4" fontSize='1.75rem' mt='1.5rem' mb='0.8rem'>{children}</Typography>
export const SubHeading = ({children}: {children: any }) => <Typography variant="h5" fontSize='1.4rem' mt='1rem' mb='0.8rem'>{children}</Typography>
export const MinorHeading = ({id, children}: {id?: string, children: any }) => <Typography variant="h6" id={id}>{children}</Typography>
export const Para = ({id, children}: {id?: string, children: any }) => <Typography {...idIfPresent(id)} variant="body1" component='div' gutterBottom>{children}</Typography>
export const BulletList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ul>{children}</ul></Typography>
export const NumberedList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ol>{children}</ol></Typography>
export const NamedList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div' marginLeft='2em'><dl>{children}</dl></Typography>
export const NLItem = ({name, children}: {name: string, children: any}) => <>
        <Typography variant='body1' fontWeight='bold'>{name}</Typography>
        <Para>{children}</Para>
</>
export const HelpLink = ({id, children}: {id: string, children?: any}) => <Link href={'#' + id}>{children || startCase((id))}</Link>

export const PropertyEntry = ({name, type, id, children}: {name: string, type: string, id: string, children: any}) =>
    <Para id={id}> <b>{name}</b>&nbsp;&nbsp;&nbsp;&nbsp;<i>Type: {type}</i><br/>{children}</Para>

export const ElementSection = ({name, description, id, properties}: {name: string, description: ReactNode, id: string, properties: ReactNode}) =>
    <SubSection id={id}>
        <SubHeading>{name}</SubHeading>

        <MinorHeading>Description</MinorHeading>
        <Para>{description}</Para>

        <MinorHeading>Properties</MinorHeading>
        {properties}
    </SubSection>

export const FunctionInput = ({name, type, optional = false, children}: {name: string, type: string, optional?: boolean, children: any}) =>
    <Para> <b>{name}</b>&nbsp;&nbsp;&nbsp;&nbsp;<i>Type: {type} {optional ? '(optional)' : ''}</i><br/>{children}</Para>

export const FunctionExample = ({name, inputs, children}: {name: string, inputs: string[], children?: ReactNode}) => <Para><code>{name}( {inputs.join(', ')} )</code><br/>{children}</Para>

export const FunctionSection = ({name, description, id, resultType, inputs, examples}:
                                    {name: string, description: ReactNode, id: string, resultType: string, inputs: ReactNode, examples: ReactNode}) =>
    <SubSection id={id}>
        <SubHeading>{name}</SubHeading>
        <Para> <i>Result type: {resultType}</i></Para>
        <MinorHeading>Description</MinorHeading>
        <Para>{description}</Para>

        <MinorHeading>Inputs</MinorHeading>
        {inputs}

        <MinorHeading>Examples</MinorHeading>
        {examples}
    </SubSection>
