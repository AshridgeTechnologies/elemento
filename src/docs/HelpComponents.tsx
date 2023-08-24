import React, {ReactNode} from 'react'
import {Typography} from '@mui/material'

export const helpElementId = (helpId: string) => 'help-' + helpId
const idIfPresent = (helpId?: string) => helpId ? {id: helpElementId(helpId)} : {}
export const Section = ({helpId, children}: {helpId: string, children: any}) => <section id={helpElementId(helpId)}>{children}</section>
export const SubSection = ({helpId, children}: {helpId: string, children: any}) => <article id={helpElementId(helpId)}>{children}</article>
export const Heading = ({children}: {children: any }) => <Typography variant="h4" fontSize='1.75rem' mt='1.5rem' mb='0.8rem'>{children}</Typography>
export const SubHeading = ({children}: {children: any }) => <Typography variant="h5" fontSize='1.4rem' mt='1rem' mb='0.8rem'>{children}</Typography>
export const MinorHeading = ({children}: {children: any }) => <Typography variant="h6">{children}</Typography>
export const Para = ({helpId, children}: {helpId?: string, children: any }) => <Typography {...idIfPresent(helpId)} variant="body1" component='div' gutterBottom>{children}</Typography>
export const BulletList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ul>{children}</ul></Typography>
export const NumberedList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ol>{children}</ol></Typography>
export const NamedList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><dl>{children}</dl></Typography>

export const PropertyEntry = ({name, type, helpId, children}: {name: string, type: string, helpId: string, children: any}) =>
    <Para helpId={helpId}> <b>{name}</b>&nbsp;&nbsp;&nbsp;&nbsp;<i>Type: {type}</i><br/>{children}</Para>

export const ControlSection = ({name, description, helpId, properties}: {name: string, description: ReactNode, helpId: string, properties: ReactNode}) =>
    <SubSection helpId={helpId}>
        <SubHeading>{name}</SubHeading>

        <MinorHeading>Description</MinorHeading>
        <Para>{description}</Para>

        <MinorHeading>Properties</MinorHeading>
        {properties}
    </SubSection>

export const FunctionInput = ({name, type, optional = false, children}: {name: string, type: string, optional?: boolean, children: any}) =>
    <Para> <b>{name}</b>&nbsp;&nbsp;&nbsp;&nbsp;<i>Type: {type} {optional ? '(optional)' : ''}</i><br/>{children}</Para>

export const FunctionExample = ({name, inputs, children}: {name: string, inputs: string[], children?: ReactNode}) => <Para><code>{name}( {inputs.join(', ')} )</code><br/>{children}</Para>

export const FunctionSection = ({name, description, helpId, resultType, inputs, examples}:
                                    {name: string, description: ReactNode, helpId: string, resultType: string, inputs: ReactNode, examples: ReactNode}) =>
    <SubSection helpId={helpId}>
        <SubHeading>{name}</SubHeading>
        <Para> <i>Result type: {resultType}</i></Para>
        <MinorHeading>Description</MinorHeading>
        <Para>{description}</Para>

        <MinorHeading>Inputs</MinorHeading>
        {inputs}

        <MinorHeading>Examples</MinorHeading>
        {examples}
    </SubSection>
