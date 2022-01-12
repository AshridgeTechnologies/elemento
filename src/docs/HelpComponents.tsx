import React from 'react'
import {Typography} from '@mui/material'
export const SectionHeading = ({children}: {children: any }) => <Typography variant="h4">{children}</Typography>
export const SubHeading = ({children}: {children: any }) => <Typography variant="h5">{children}</Typography>
export const Para = ({children}: {children: any }) => <Typography variant="body1" gutterBottom>{children}</Typography>
export const BulletList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ul>{children}</ul></Typography>
export const NumberedList = ({children}: {children: any }) => <Typography variant="body1" gutterBottom component='div'><ol>{children}</ol></Typography>
