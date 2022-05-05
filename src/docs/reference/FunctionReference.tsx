import React from "react"
import {
    FunctionExample, FunctionInput,
    FunctionSection,
    Heading,
    Para,
    Section,
    SubHeading,
    SubSection
} from '../HelpComponents'

export default () =>
    <Section helpId='function-reference'>
        <Heading>Function Reference</Heading>
        <Para>
            This section explains, for every built-in function, what it does and how to use it - what inputs you need to
            give it, and what result you get from it.
        </Para>

        <SubSection helpId='function-inputs'>
            <SubHeading>Inputs</SubHeading>
            <Para>The most important thing to know about a function is what properties it has.
                You type the fixed values or formulas that set the inputs in the brackets after the function name.
            </Para>
            <Para>
                Some inputs are <b>required</b> - the function will not work unless you supply them. Inputs may have
                a <b>default</b> value - a built-in value that is used if you don't supply this input.
            </Para>
        </SubSection>

        <FunctionSection name='Add' helpId='Add' resultType='action'
                         description='Add an item to a Collection'

                         inputs={
                             <FunctionInput name='Items' type='list'>A list of item values, of any type.
                             </FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='List' inputs={['"Wayne"', '"Cheng"', '10']}>
                                 This results in a list with three items:  "Wayne", "Cheng", 10
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='List' helpId='List' resultType='list'
                         description='Create a list from the item values supplied.'

                         inputs={
                             <FunctionInput name='Items' type='list'>A list of item values, of any type.
                             </FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='List' inputs={['"Wayne"', '"Cheng"', '10']}>
                                 This results in a list with three items:  "Wayne", "Cheng", 10
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Log' helpId='Log' resultType='action'
                         description='Writes a message to the app log.'

                         inputs={
                             <FunctionInput name='Items' type='anything list'>The items to write to the log</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Log' inputs={['10', '20', '30']}/>
                             <FunctionExample name='Log' inputs={['"The delivery amount is"', 'Delivery']}/>
                         </>}
        />

        <FunctionSection name='Record' helpId='Record' resultType='record'
                         description='Create a record from successive pairs of item name and value.'

                         inputs={
                             <FunctionInput name='Name Value Pairs' type='list'>A list of pairs of name and value.  There must be an even number of arguments.
                                 The first argument and all other odd-numbered arguments are the names of the items, and they must be text.
                                 The second argument and the other even-numbered arguments are the values associated with the preceding name, and they can be any type of value.
                             </FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Record' inputs={['FirstName', '"Wayne"', 'LastName', '"Cheng"']}>
                                 This results in a record with two items:  FirstName = "Wayne" and LastName = "Cheng"
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Reset' helpId='Reset' resultType='action'
                         description='Reset the value of a control to its initial value.'

                         inputs={
                             <FunctionInput name='Control' type='Control'>The control to reset.</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Reset' inputs={['LastnameInput']}/>
                         </>}
        />

        <FunctionSection name='Set' helpId='Set' resultType='action'
                         description='Set the value of a Data control.  Any previous value is completely replaced.'

                         inputs={<>
                             <FunctionInput name='Control' type='Data Control'>The Data control in which the value is set.</FunctionInput>
                             <FunctionInput name='Value' type='anything'>The value to set.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Set' inputs={['NameToUse', 'NameInput']}/>
                         </>}
        />

        <FunctionSection name='ShowPage' helpId='ShowPage' resultType='action'
                         description='Shows one of the Pages in the App.'

                         inputs={
                             <FunctionInput name='Page' type='Page'>The Page to show.  It must be the name of one of the Pages defined under the App.</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='ShowPage' inputs={['UserPage']}/>
                         </>}
        />

        <FunctionSection name='Sum' helpId='Sum' resultType='number'
                         description='Adds up a list of numbers'

                         inputs={
                             <FunctionInput name='Numbers' type='number list'>The list of numbers to add
                                 up</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Sum' inputs={['10', '20', '30']}/>
                             <FunctionExample name='Sum' inputs={['Goods', 'Delivery', 'Tax']}/>
                         </>}
        />

        <FunctionSection name='Update' helpId='Update' resultType='action'
                         description='Update the value of a Data control.  Any previous value is updated with the changes given,
                         and items not affected by the changes remain the same.
                         This only works if the Data control is storing a record value.'

                         inputs={<>
                             <FunctionInput name='Control' type='Data Control'>The Data control in which the value is set.</FunctionInput>
                             <FunctionInput name='Changes' type='record'>The changes to make to the current record.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Update' inputs={['Customer', '{Firstname: "Marcel", Surname: "Dupont"}']}>
                                 This will update the Firstname and Surname data items in the Customer Data control, but leave all the other data items the same.
                             </FunctionExample>
                         </>}
        />


    </Section>

