import React from 'react'
import {
    BulletList,
    Heading, HelpLink,
    MinorHeading,
    NamedList, NLItem,
    NumberedList,
    Para,
    Section,
    SubHeading,
    SubSection
} from '../HelpComponents'
import {Link} from '@mui/material'

export default () =>
    <Section id='storing-data'>
        <Heading>Storing Data</Heading>
        <Para>
            Almost any interesting app needs to store data at some point, look it up again later, and maybe change it
            over time.
            Elemento provides several says of storing data, and more will be added in the future. Each of these is
            suitable for a particular situation.
        </Para>

        <SubSection id='choosing-data=storage'>
            <Para>
                The type of data, where it is needed, who needs to use it, and how long it is needed for can vary a lot.
                And those factors may be different for each item of data the app stores. So there are a lot of choices,
                but most of it is common sense.
                Here are the things you need to think about:
            </Para>
            <NamedList>
                <NLItem name='Type (and quantity)'>
                    <Para>The data stored may be very simple, like a single name or number,
                        or it could be a large database with thousands of records.</Para>
                    <BulletList>
                        <li>In a word-guessing game, you might just need to store the answer and the guesses entered
                        </li>
                        <li>In an online shop, you would need to store complex records about many products, customers
                            and orders
                        </li>
                    </BulletList>
                </NLItem>

                <NLItem name='How long the data is needed'>
                    <Para>The data may only be needed for the time you are using the app,
                        or it could need to be kept for years and be available again each time you use the app.</Para>
                    <BulletList>
                        <li>In a calculator app, you would not need any of the data once you had closed the app</li>
                        <li>In an online shop, you would expect orders you had placed to be available for years</li>
                        <li>In a daily word game, you might only need the guesses to be stored while playing on each
                            day,
                            but the statistics about how you had done over time could be kept indefinitely
                        </li>
                    </BulletList>
                </NLItem>
                <NLItem name='Who enters and changes the data'>
                    <Para>Is the data specific to each individual user of the app, or does it need to seen and maybe
                        changed by many people?
                        Even if it is specific to a user, maybe there are also administrators who can see everyone's
                        data.</Para>
                    <BulletList>
                        <li>In a word-guessing game, each player's entries would probably be private to them, and no-one
                            else needs to see them
                        </li>
                        <li>In an online shop, products would be seen by everybody, customers and orders only by the
                            individual customer,
                            and there would be administrators who can see and change anyone's data.
                        </li>
                    </BulletList>
                </NLItem>

                <NLItem name='Where the data is needed'>
                    <Para>Is the data only needed on one computer or device?
                        Is it needed by a single user, but on different devices at different times?
                        Or is it needed by many users, which will obviously mean it is needed on different computers.
                    </Para>
                    <BulletList>
                        <li>In a note-taking app, each user should only see their own notes,
                            and it might be suitable to keep the data on the device where it is entered.
                            But if the user wants to see the notes on their phone, tablet and computer at different
                            times,
                            the data will need to kept where it can be accessed from each of the devices
                        </li>
                        <li>In an online shop, the data is needed by many people,
                            and each user may look at their own data from a phone or a computer at different times,
                            so the data would need to be kept in a central store.
                        </li>
                    </BulletList>
                </NLItem>

            </NamedList>
        </SubSection>

        <SubSection id='types-of-data-store'>
            <SubHeading>Data Stores in Elemento</SubHeading>
            <Para>Elemento has several types of data store. Each one has various characteristics that may make it
                suitable for different types of data in your app.
                This section describes where and when you would use each one. For detailed information on their
                properties and setting them up,
                see the <HelpLink id='elements-reference'/>.
            </Para>

            <MinorHeading id='data-data-store'><HelpLink id='data'/></MinorHeading>
            <Para>This is the simplest way of storing data, and different to the other Data Stores below. It just stores
                the value in the memory of the running app.
                This means that:
                <BulletList>
                    <li>The data is available only as long as the app runs</li>
                    <li>The data is available only on the computer or device where it is created, and therefore only to
                        one user
                    </li>
                    <li>You can put any single value you like into it, and use the whole value, although that value can
                        be a more complicated type,
                        such as a <HelpLink id='structured-data-types'>Record or a List</HelpLink></li>
                    <li>You cannot store large amounts of complex data in collections, or access one record at a time or
                        do queries.
                    </li>
                </BulletList>
            </Para>

            <MinorHeading id='collection-data-store'><HelpLink id='collection'/></MinorHeading>
            <Para>A Collection element on its own stores a set of items in the memory of the running app. This means
                that:</Para>
            <BulletList>
                <li>The data is available only as long as the app runs</li>
                <li>The data is available only on the computer or device where it is created, and therefore only to one
                    user
                </li>
                <li>You can store medium amounts of complex data (100MB), and access one record at a time or do
                    queries.
                </li>
            </BulletList>
            <Para>However if you connect a Collection to a Data Store, the data is copied to and from the Data Store
                automatically,
                so the Collection then has the characteristics of the Data Store it is connected to.</Para>
            <Para>So for items of data that need to be added and changed quickly and are only needed in this run of the
                app,
                use a Collection on its own. For items that need to be kept long-term, and it doesn't matter if it takes
                a second or so to update them,
                use a Collection connected to a Data Store.</Para>

            <MinorHeading id='browser-data-store'><HelpLink id='browserDataStore'/></MinorHeading>
            <Para>This stores data in a private permanent store on the computer, managed by the browser (IndexedDB, if
                you're a developer and interested). This means that:</Para>
            <BulletList>
                <li>The data is available indefinitely</li>
                <li>The data is available only on the computer or device where it is created, and therefore only to one
                    user
                </li>
                <li>You can store large amounts (several GB) of complex data in collections, and access one record at a
                    time or do queries.
                </li>
                <li>You cannot easily copy the data or transfer it somewhere else, for backups or sharing</li>
            </BulletList>

            <MinorHeading id='file-data-store'><HelpLink id='fileDataStore'/></MinorHeading>
            <Para>This stores data in a private permanent store on the computer, held in a file on the computer disk,
                which the user chooses. This means that:</Para>
            <BulletList>
                <li>The data is available indefinitely</li>
                <li>The data is available only on the computer or device where it is created</li>
                <li>The file can be copied and transferred to another computer, either for backup or to use there
                    (but there is no way of merging changes back into the original file)
                </li>
                <li>You can store medium amounts of complex data (100MB) in collections, and access one record at a time
                    or do queries.
                </li>
            </BulletList>

        </SubSection>

        <SubSection id='using-data-stores-collections'>
            <SubHeading>Using Data Stores and Collections</SubHeading>
            <Para>You cannot use a Data Store on its own - you need to connect a Collection to it to access the data.
                You can connect several Collections to the same Data Store.
                You would normally have one Collection for each type of data you are dealing with, such as Customers,
                Orders, Products, etc,
                but connect them all to the same data store so that all the permanent data for your app is kept in the
                same place.
            </Para>
            <Para>To add a Data Store or a Collection to your app, insert an element of the type you want under the App
                element.
                You can use it in formulas anywhere in the app. More details in the <HelpLink id='elements-reference'/></Para>

            <MinorHeading>Accessing Collections</MinorHeading>
            <Para>There are several functions you can use to put data into a Collection and get it out again.</Para>
            <NamedList>
                <NLItem name={<HelpLink id='Add'/>}>
                    <Para>Put a new item into the collection - use in <HelpLink id='action-formulas'/></Para>
                </NLItem>
                <NLItem name={<HelpLink id='Update-Collection'>Update</HelpLink>}>
                    <Para>Make changes to an existing item in the collection - use in <HelpLink
                        id='action-formulas'/></Para>
                </NLItem>
                <NLItem name={<HelpLink id='Remove'/>}>
                    <Para>Remove an item from the collection - use in <HelpLink id='action-formulas'/></Para>
                </NLItem>
                <NLItem name={<HelpLink id='Get'/>}>
                    <Para>Get an item from the collection - use in <HelpLink id='calculation-formulas'/></Para>
                </NLItem>
                <NLItem name={<HelpLink id='Query'/>}>
                    <Para>Get multiple items from the collection, selected by given conditions - use in <HelpLink
                        id='calculation-formulas'/></Para>
                </NLItem>
            </NamedList>

        </SubSection>

    </Section>
