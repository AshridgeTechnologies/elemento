Server apps example
===================

Aims
====

- Help people learn how to use server apps
- Help people learn how to create record-keeping apps

Requirements
------------

## Features included
- Server App
- Server-side data store
- Access checks
- Validation
- Authorization based on User
- Uses another API with credentials
- Exposes an API

## Approach
- Relevant subject
- Don't use other features unless really needed
- Quick Tour tool

## Overall App features
- Staff holiday booking
- Users view, add, update, delete their own holiday bookings
- View holiday calendar for everyone
- Holiday calendar API
- Send Emails for changes via API
- Send emails to manager and user as appropriate
- Managers approve holiday changes
- View holiday calendar for own team
- User management

## Part 1 - Server App only
- Data store with collections:
  - Booking - user id, startDate, finishDate, approved
  - Users - id, manager
  - Settings
- Add own holiday booking
- Update own holiday booking
- Delete own holiday booking
- Approve holiday booking
- View own holiday bookings
- View team holiday bookings
- View all holiday bookings
- Send emails for changes
- Store email service credentials in secret permanent store

## Part 2 - Server App Quick Tour
- Highlight important features of each function

## Part 3 - User interface
- User page
- Team page




