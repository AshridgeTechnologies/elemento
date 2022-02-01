import React from 'react'
import {Typography} from '@mui/material'
export const helpElementId = (helpId: string) => 'help-' + helpId
export const Section = ({helpId, children}: {helpId: string, children: any}) => <section id={helpElementId(helpId)}>{children}</section>
export const SubSection = ({helpId, children}: {helpId: string, children: any}) => <article id={helpElementId(helpId)}>{children}</article>
export const Heading = ({children}: {children: any }) => <Typography variant="h4" >{children}</Typography>
export const SubHeading = ({children}: {children: any }) => <Typography variant="h5">{children}</Typography>
export const MinorHeading = ({children}: {children: any }) => <Typography variant="h6">{children}</Typography>
export const Para = ({children}: {children: any }) => <Typography variant="body1" gutterBottom>{children}</Typography>
export const BulletList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ul>{children}</ul></Typography>
export const NumberedList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ol>{children}</ol></Typography>
