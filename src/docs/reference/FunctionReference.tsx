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
    </Section>

