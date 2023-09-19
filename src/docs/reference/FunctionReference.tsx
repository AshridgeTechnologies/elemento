import React from 'react'
import {
    FunctionExample,
    FunctionInput,
    FunctionSection,
    Heading,
    HelpLink, NamedList,
    NLItem,
    Para,
    Section,
    SubHeading,
    SubSection
} from '../HelpComponents'
import {Link} from '@mui/material'

export default () =>
    <Section id='function-reference'>
        <Heading>Function Reference</Heading>
        <Para>
            This section explains, for every built-in function, what it does and how to use it - what inputs you need to
            give it, and what result you get from it.
        </Para>

        <SubSection id='function-inputs'>
            <SubHeading>Inputs</SubHeading>
            <Para>The most important thing to know about a function is what inputs it has.
                You type the fixed values or formulas that set the inputs in the brackets after the function name.
            </Para>
            <Para>
                Some inputs are <b>required</b> - the function will not work unless you supply them. Inputs may have
                a <b>default</b> value - a built-in value that is used if you don't supply this input.
            </Para>
        </SubSection>

        <FunctionSection name='Add' id='Add' resultType='action'
                         description={<span>Insert a new item into a <HelpLink id='collection'/></span>}
                         inputs={<>
                             <FunctionInput name='Collection' type='Collection'>The Collection to which the item is
                                 added</FunctionInput>
                             <FunctionInput name='Item' type='any'>The item to add.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Add' inputs={['Customers', 'NewCustomerRecord']}></FunctionExample>
                             <FunctionExample name='Add' inputs={['Orders', 'OrderForm.value']}></FunctionExample>
                         </>}
        />

        <FunctionSection name='And' id='And' resultType='true-false'
                         description='Check two or more values (conditions) to see if they are all true'

                         inputs={<>
                             <FunctionInput name='First value' type='true-false'>The first value to
                                 check</FunctionInput>
                             <FunctionInput name='Second value' type='true-false'>The second value to
                                 check</FunctionInput>
                             <FunctionInput name='Further values...' type='true-false' optional>Any further values to
                                 check</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='And' inputs={['true', 'false']}>Result: false</FunctionExample>
                             <FunctionExample name='And' inputs={['true', 'false', 'true', 'true']}>Result:
                                 false</FunctionExample>
                             <FunctionExample name='And' inputs={['true', 'true']}>Result: true</FunctionExample>
                             <FunctionExample name='And' inputs={['Gt(Length, 1)', 'Type == "Medium"']}>Result: true if
                                 Length is greater than 1 and Type is "Medium"</FunctionExample>
                         </>}
        />

        <FunctionSection name='Ceiling' id='Ceiling' resultType='number'
                         description='Rounds a number up to a certain number of decimal digits.'

                         inputs={<>
                             <FunctionInput name='Number' type='number'>The number to round up.</FunctionInput>
                             <FunctionInput name='Decimal Digits' type='number' optional>The number of decimal digits to
                                 round up to. If not given, assumes no decimal digits.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Ceiling' inputs={['10.013', '2']}>Result: 10.02</FunctionExample>
                             <FunctionExample name='Ceiling' inputs={['10.5']}>Result: 11</FunctionExample>
                             <FunctionExample name='Ceiling' inputs={['10.4']}>Result: 11</FunctionExample>
                         </>}
        />

        <FunctionSection name='CsvToRecords' id='CsvToRecords' resultType='list of records'
                         description='Reads data from text in CSV format.'

                         inputs={<>
                             <FunctionInput name='CSV Data' type='text'>The text containing the CSV
                                 rows.</FunctionInput>
                             <FunctionInput name='Column Names' type='list of text' optional>The names of the columns.
                                 If not given, assumes the names are in the first row.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <Para>To be added</Para>
                         </>}
        />

        <FunctionSection name='D' id='D' resultType='decimal'
                         description='Convert a general number or text containing a number to a Decimal'

                         inputs={
                             <FunctionInput name='Number' type='text or number'>The number to be converted.
                             </FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='D' inputs={['10']}>This results in a Decimal with the value
                                 10.0</FunctionExample>
                             <FunctionExample name='D' inputs={['"27.3456"']}>This results in a Decimal with the value
                                 27.3456</FunctionExample>
                         </>}
        />

        <FunctionSection name='DateAdd' id='DateAdd' resultType='date'
                         description='Add a time period in various units to a date, or subtract using a negative time period.'

                         inputs={<>
                             <FunctionInput name='Date' type='date'>The date to start from</FunctionInput>
                             <FunctionInput name='Change' type='number'>The number of Units to add (or subtract if
                                 negative)</FunctionInput>
                             <FunctionInput name='Unit' type='text'>The units to get the difference in.
                                 One of: "seconds", "minutes", "hours", "days", "months", "years"</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='DateAdd' inputs={['DateVal("2022-03-01")', '10', '"day"']}>Result:
                                 11 March 2022</FunctionExample>
                             <FunctionExample name='DateAdd' inputs={['DateVal("2019-03-01")', '4', '"year"']}>Result: 1
                                 March 2023</FunctionExample>
                             <FunctionExample name='DateAdd'
                                              inputs={['DateVal("2022-03-01T02:03:25")', '-10', '"seconds"']}>Result: 1
                                 March 2022 at 02:03 and 15 seconds</FunctionExample>
                         </>}
        />

        <FunctionSection name='DateFormat' id='DateFormat' resultType='text'
                         description='Get a text representation of a date in a certain format'

                         inputs={<>
                             <FunctionInput name='Date' type='date'>The date to format</FunctionInput>
                             <FunctionInput name='Format' type='text'>The format in which to represent the date.
                                 The format is a set of letter codes following <Link
                                     href='https://date-fns.org/v2.30.0/docs/parse'>these rules</Link></FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='DateFormat' inputs={['DateVal("2022-03-01")', '"dd MMM yyyy"']}>Result:
                                 "01 Mar 2022"</FunctionExample>
                             <FunctionExample name='DateFormat'
                                              inputs={['DateVal("2022-03-01T02:03:25")', '"dd/MM/yy HH:mm"']}>Result:
                                 "01/03/22 02:03"</FunctionExample>
                         </>}
        />

        <FunctionSection name='DateVal' id='DateVal' resultType='date'
                         description={<>
                             <Para>Create a Date from various other values.</Para>
                             <NamedList>
                                 <NLItem name='Single text value'>
                                     <Para>The text is interpreted as a standard <Link
                                         href='https://www.iso.org/iso-8601-date-and-time-format.html'>ISO date</Link>.
                                         So "2022-03-04 12:34:56" would result in a date of 4 April 2022 at 12:34 and 56
                                         seconds</Para>
                                 </NLItem>
                                 <NLItem name='Year, month and day as numbers'>
                                     <Para>Gives a date with the given year, month, day</Para>
                                 </NLItem>
                                 <NLItem name='Text date, format (advanced usage)'>
                                     <Para>Interprets the text according to the format.
                                         The format is a set of letter codes following <Link
                                             href='https://date-fns.org/v2.30.0/docs/parse'>these rules</Link>
                                     </Para></NLItem>
                                 <NLItem name='A date value'>
                                     <Para>The result is the same date value</Para>
                                 </NLItem>
                                 <NLItem name='A null (empty) value'>
                                     <Para>The result is null</Para></NLItem>
                             </NamedList>
                         </>
                         }

                         inputs={<>
                             <Para>Various - see the description above</Para>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='DateVal' inputs={['"2022-03-01"']}>Result: 1 March 2022 at
                                 midnight</FunctionExample>
                             <FunctionExample name='DateVal' inputs={['"2022-03-01T02:03:14"']}>Result: 1 March 2022 at
                                 02:03 and 14 seconds</FunctionExample>
                             <FunctionExample name='DateVal' inputs={['2022', '3', '1']}>Result: 1 March 2022 at
                                 midnight</FunctionExample>
                             <FunctionExample name='DateVal' inputs={['"01 Mar 2022', '"dd MMM yyyy"']}>Result: 1 March
                                 2022 at midnight</FunctionExample>
                         </>}
        />

        <FunctionSection name='DaysBetween' id='DaysBetween' resultType='number'
                         description='Get the difference between two Date/Time values in calendar days, disregarding the time.
                         If First Date is after Second Date, the result will be a negative number.'

                         inputs={<>
                             <FunctionInput name='First Date' type='date'>The date expected to be
                                 earlier</FunctionInput>
                             <FunctionInput name='Second Date' type='date'>The date expected to be later</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='DaysBetween'
                                              inputs={['DateVal("2022-03-01")', 'DateVal("2022-03-21")']}>Result:
                                 20</FunctionExample>
                             <FunctionExample name='DaysBetween'
                                              inputs={['DateVal("2022-03-01T02:03:00")', 'DateVal("2022-03-01T12:04:00")']}>Result:
                                 0</FunctionExample>
                         </>}
        />

        <FunctionSection name='Div' id='Div' resultType='number or Decimal'
                         description='Divide the first number by one or more other numbers.  If any of the numbers is a Decimal, the result will be a Decimal'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The number to start
                                 with.</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The first number to divide
                                 First Number by.</FunctionInput>
                             <FunctionInput name='Number 3, 4, 5, etc...' type='number or Decimal' optional>Further
                                 numbers to divide by</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Div' inputs={['60', '10']}>Result: 6 (60 / 10)</FunctionExample>
                             <FunctionExample name='Div' inputs={['D(10)', '20', '50']}>Result: Decimal with a value of
                                 0.01 (10 / 20 / 50)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Eq' id='Eq' resultType='true-false'
                         description='Compare two numbers to see if the first is equal to the second'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Eq' inputs={['60', '10']}>Result: false</FunctionExample>
                             <FunctionExample name='Eq' inputs={['D(10)', '20']}>Result: false</FunctionExample>
                             <FunctionExample name='Eq' inputs={['D(10)', '10']}>Result: true</FunctionExample>
                         </>}
        />

        <FunctionSection name='First' id='First' resultType='any'
                         description='Get the first value from a list where a given condition is true, or an empty value (null) if the condition is not true for any value in the list.'

                         inputs={<>
                             <FunctionInput name='Values' type='list of any type'>The list of values to select
                                 from</FunctionInput>
                             <FunctionInput name='Condition' type='formula giving true-false'>Used to check the values
                                 to find the result.
                                 It is applied to each of Values in turn, and if it results in true, that value is the
                                 result.
                                 It should use the special name <code>$item</code> to mean the item that is being
                                 checked.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='First' inputs={['List(10, 20, 30, 40)', 'Gt($item, 25)']}>Result:
                                 30</FunctionExample>
                             <FunctionExample name='First'
                                              inputs={['List("Ahmed", "Bobo", "Candice", "Jo")', 'Gt($item.length, 5)']}>Result:
                                 "Candice"</FunctionExample>
                             <FunctionExample name='First' inputs={['List(50, 10, 20, 30, 40)', 'Gt($item, 100)']}>Result:
                                 empty (null)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Floor' id='Floor' resultType='number'
                         description='Rounds a number down to a certain number of decimal digits.'

                         inputs={<>
                             <FunctionInput name='Number' type='number'>The number to round down.</FunctionInput>
                             <FunctionInput name='Decimal Digits' type='number' optional>The number of decimal digits to
                                 round down to. If not given, assumes no decimal digits.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Floor' inputs={['10.017', '2']}>Result: 10.01</FunctionExample>
                             <FunctionExample name='Floor' inputs={['10.5']}>Result: 10</FunctionExample>
                             <FunctionExample name='Floor' inputs={['10.4']}>Result: 10</FunctionExample>
                         </>}
        />

        <FunctionSection name='ForEach' id='ForEach' resultType='list of any type'
                         description='Create a new list from the values in a given list using a formula applied to each value.'

                         inputs={<>
                             <FunctionInput name='Values' type='list of any type'>The starting list of
                                 values</FunctionInput>
                             <FunctionInput name='Formula' type='formula giving any type'>Calculates each of the values
                                 in the result.
                                 It is applied to each of Values in turn, and its result is added to the result list.
                                 It should use the special name <code>$item</code> to mean the item in the original list
                                 that it is being applied to.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='ForEach' inputs={['List(50, 10, 20)', '$item + 2)']}>Result: list
                                 containing 52, 12, 22</FunctionExample>
                             <FunctionExample name='ForEach'
                                              inputs={['List("Andrew", "Bobo", "Candice", "Jo")', '$item.length']}>Result:
                                 list containing 6, 4, 7, 2</FunctionExample>
                         </>}
        />

        <FunctionSection name='Get' id='Get' resultType='any'
                         description='Get an item in a Collection, identified by id.'

                         inputs={<>
                             <FunctionInput name='Collection' type='Collection'>The Collection in which to get the
                                 item.</FunctionInput>
                             <FunctionInput name='Id' type='Collection'>The id of the item to get.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Get' inputs={['Customers', 'currentId']}>
                                 This will get the item in the Customers Collection which has the id in 'currentId'.
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Gt' id='Gt' resultType='true-false'
                         description='Compare two numbers to see if the first is greater than the second'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Gt' inputs={['60', '10']}>Result: true</FunctionExample>
                             <FunctionExample name='Gt' inputs={['D(10)', '20']}>Result: false</FunctionExample>
                             <FunctionExample name='Gt' inputs={['D(10)', '10']}>Result: false, because the first number
                                 is equal to the second, not greater</FunctionExample>
                         </>}
        />

        <FunctionSection name='Gte' id='Gte' resultType='true-false'
                         description='Compare two numbers to see if the first is greater than or equal to the second'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Gte' inputs={['60', '10']}>Result: true</FunctionExample>
                             <FunctionExample name='Gte' inputs={['D(10)', '20']}>Result: false</FunctionExample>
                             <FunctionExample name='Gte' inputs={['D(10)', '10']}>Result: true</FunctionExample>
                         </>}
        />

        <FunctionSection name='If' id='If' resultType='any'
                         description='Choose between two values, depending on another value'

                         inputs={<>
                             <FunctionInput name='Condition' type='true-false'>Controls which of the two values is used
                                 in the result</FunctionInput>
                             <FunctionInput name='Value 1' type='any'>The result if Condition is true</FunctionInput>
                             <FunctionInput name='Value 2' type='any' optional>The result if Condition is false. If this
                                 input is not supplied,
                                 the result is an empty value when Condition is false</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='If' inputs={['true', '10', '20']}>Result: 10</FunctionExample>
                             <FunctionExample name='If' inputs={['false', '10', '20']}>Result: 20</FunctionExample>
                             <FunctionExample name='If' inputs={['Gt(10, 9)', '20']}>Result: 20</FunctionExample>
                             <FunctionExample name='If' inputs={['Lt(10, 9)', '20']}>Result: empty
                                 (undefined)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Last' id='Last' resultType='any'
                         description='Get the last value from a list where a given condition is true, or an empty value (null) if the condition is not true for any value in the list.'

                         inputs={<>
                             <FunctionInput name='Values' type='list of any type'>The list of values to select
                                 from</FunctionInput>
                             <FunctionInput name='Condition' type='formula giving true-false'>Used to check the values
                                 to find the result.
                                 It is applied to each of Values in turn, working back from the end and if it results in
                                 true, that value is the result.
                                 It should use the special name <code>$item</code> to mean the item that is being
                                 checked.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Last' inputs={['List(10, 20, 30, 40)', 'Gt($item, 25)']}>Result:
                                 40</FunctionExample>
                             <FunctionExample name='Last'
                                              inputs={['List("Ahmed", "Bobo", "Candice", "Jo")', 'Gt($item.length, 4)']}>Result:
                                 "Candice"</FunctionExample>
                             <FunctionExample name='Last' inputs={['List(50, 10, 20, 30, 40)', 'Gt($item, 100)']}>Result:
                                 empty (null)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Left' id='Left' resultType='text'
                         description='Get part of a text value, starting at the beginning.'

                         inputs={<>
                             <FunctionInput name='Text' type='text'>The original text</FunctionInput>
                             <FunctionInput name='Length' type='number'>The number of characters to take from the start
                                 of Text.
                                 If this is more than the length of Text, the result is the whole of
                                 Text.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Left' inputs={['"abcde"', '3']}>Result: "abc"</FunctionExample>
                             <FunctionExample name='Left' inputs={['"abcde"', '6']}>Result: "abcde"</FunctionExample>
                             <FunctionExample name='Left' inputs={['"abcde"', '0']}>Result: "" (an empty
                                 text)</FunctionExample>
                         </>}
        />

        <FunctionSection name='List' id='List' resultType='list'
                         description='Create a list from the item values supplied.'

                         inputs={<>
                             <FunctionInput name='Item 1' type='any'>The first item value</FunctionInput>
                             <FunctionInput name='Item 2, 3, 4, etc...' type='any'>Further item values</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='List' inputs={['"Wayne"', '"Cheng"', '10']}>
                                 This results in a list with three items: "Wayne", "Cheng", 10
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Log' id='Log' resultType='action'
                         description='Writes a message to the app log.  This currently appears in the browser console, that you can find in the Developer Tools.'

                         inputs={
                             <FunctionInput name='Items' type='anything list'>The items to write to the
                                 log</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Log' inputs={['10', '20', '30']}>Logs: 10 20 30</FunctionExample>
                             <FunctionExample name='Log' inputs={['"The delivery amount is"', 'Delivery']}>If Delivery
                                 had the value 20, this would log: The delivery amount is 20</FunctionExample>
                         </>}
        />

        <FunctionSection name='Lt' id='Lt' resultType='true-false'
                         description='Compare two numbers to see if the first is less than the second'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Lt' inputs={['60', '10']}>Result: false</FunctionExample>
                             <FunctionExample name='Lt' inputs={['D(10)', '20']}>Result: true</FunctionExample>
                             <FunctionExample name='Lt' inputs={['D(10)', '10']}>Result: false, because the first number
                                 is equal to the second, not less</FunctionExample>
                         </>}
        />

        <FunctionSection name='Lte' id='Lte' resultType='true-false'
                         description='Compare two numbers to see if the first is less than or equal to the second'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Lte' inputs={['60', '10']}>Result: false</FunctionExample>
                             <FunctionExample name='Lte' inputs={['D(10)', '20']}>Result: true</FunctionExample>
                             <FunctionExample name='Lte' inputs={['D(10)', '10']}>Result: true</FunctionExample>
                         </>}
        />

        <FunctionSection name='Max' id='Max' resultType='number or Decimal'
                         description='Find the largest of two or more numbers.  If any of the numbers is a Decimal, the result will be a Decimal'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare.</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare.</FunctionInput>
                             <FunctionInput name='Number 3, 4, 5, etc...' type='number or Decimal' optional>Further
                                 numbers to compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Max' inputs={['10', '20', '30']}>Result: 30</FunctionExample>
                             <FunctionExample name='Max' inputs={['D(10)', '50', '30']}>Result: Decimal with a value of
                                 50.0</FunctionExample>
                             <FunctionExample name='Max' inputs={['D(-10)', '-50', '-30']}>Result: Decimal with a value
                                 of -10.0, because -10 is greater than -30 or -50</FunctionExample>
                         </>}
        />

        <FunctionSection name='Mid' id='Mid' resultType='text'
                         description='Get part of a text value, starting at the beginning.'

                         inputs={<>
                             <FunctionInput name='Text' type='text'>The original text</FunctionInput>
                             <FunctionInput name='Start' type='number'>The character position in Text at which the
                                 result starts.
                                 If this is more than the length of Text, the result is an empty Text.</FunctionInput>
                             <FunctionInput name='Length' type='number' optional>The number of characters to take from
                                 the start of Text.
                                 If this plus Start is more than the length of Text, the result is the whole of Text
                                 from Start.
                                 If this is not supplied, the result is the whole of Text from Start.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Mid' inputs={['"abcde"', '3', '2']}>Result: "cd"</FunctionExample>
                             <FunctionExample name='Mid' inputs={['"abcde"', '3', '5']}>Result: "cde"</FunctionExample>
                             <FunctionExample name='Mid' inputs={['"abcde"', '6']}>Result: "" (an empty
                                 text)</FunctionExample>
                             <FunctionExample name='Mid' inputs={['"abcde"', '3']}>Result: "cde"</FunctionExample>
                             <FunctionExample name='Mid' inputs={['"abcde"', '1']}>Result: "abcde"</FunctionExample>
                         </>}
        />

        <FunctionSection name='Min' id='Min' resultType='number or Decimal'
                         description='Find the smallest of two or more numbers.  If any of the numbers is a Decimal, the result will be a Decimal'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 compare.</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 compare.</FunctionInput>
                             <FunctionInput name='Number 3, 4, 5, etc...' type='number or Decimal' optional>Further
                                 numbers to compare</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Min' inputs={['10', '20', '30']}>Result: 10</FunctionExample>
                             <FunctionExample name='Min' inputs={['10', 'D(50)', '30']}>Result: Decimal with a value of
                                 10.0</FunctionExample>
                             <FunctionExample name='Min' inputs={['D(-10)', '-50', '-30']}>Result: Decimal with a value
                                 of -50.0, because -50 is less than -30 or -10</FunctionExample>
                         </>}
        />

        <FunctionSection name='Mult' id='Mult' resultType='number or Decimal'
                         description='Multiply together two or more numbers.  If any of the numbers is a Decimal, the result will be a Decimal'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 multiply.</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 multiply.</FunctionInput>
                             <FunctionInput name='Number 3, 4, 5, etc...' type='number or Decimal' optional>Further
                                 numbers to multiply</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Mult' inputs={['5', '10']}>Result: 50 (5 x 10)</FunctionExample>
                             <FunctionExample name='Mult' inputs={['D(10)', '20', '30']}>Result: Decimal with a value of
                                 6000.0</FunctionExample>
                         </>}
        />

        <FunctionSection name='Not' id='Not' resultType='true-false'
                         description='Get the opposite of a true-false value'

                         inputs={<>
                             <FunctionInput name='Value' type='true-false'>The value to use</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Not' inputs={['true']}>Result: false</FunctionExample>
                             <FunctionExample name='Not' inputs={['false']}>Result: true</FunctionExample>
                             <FunctionExample name='Not' inputs={['Gt(Length, 1)']}>Result: false if Length is greater
                                 than 1 </FunctionExample>
                         </>}
        />

        <FunctionSection name='Now' id='Now' resultType='Date'
                         description='The current date/time'

                         inputs={<>
                             <Para>None</Para>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Now' inputs={[]}>Result: 2022-03-04 16:34:56 (the result is
                                 different every time)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Or' id='Or' resultType='true-false'
                         description='Check two or more values (conditions) to see if any of them is true'

                         inputs={<>
                             <FunctionInput name='First value' type='true-false'>The first value to
                                 check</FunctionInput>
                             <FunctionInput name='Second value' type='true-false'>The second value to
                                 check</FunctionInput>
                             <FunctionInput name='Further values...' type='true-false' optional>Any further values to
                                 check</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Or' inputs={['true', 'false']}>Result: true</FunctionExample>
                             <FunctionExample name='Or' inputs={['false', 'false', 'true', 'false']}>Result:
                                 true</FunctionExample>
                             <FunctionExample name='Or' inputs={['false', 'false']}>Result: false</FunctionExample>
                             <FunctionExample name='Or' inputs={['Gt(Length, 1)', 'Type == "Medium"']}>Result: true if
                                 Length is greater than 1 <b>or</b> Type is "Medium"</FunctionExample>
                         </>}
        />

        <FunctionSection name='Query' id='Query' resultType='any'
                         description='Get multiple items from a Collection, selected by conditions.
                         The conditions are currently very basic: you can give a set of data item values to match against the items in the collection.
                         Or you can give empty conditions to select all the items.'

                         inputs={<>
                             <FunctionInput name='Collection' type='Collection'>The Collection in which to get the
                                 item.</FunctionInput>
                             <FunctionInput name='Conditions' type='record'>The conditions to select the
                                 items.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Get'
                                              inputs={['Customers', '{LastName: "Hill", FirstName: "Stephen"}']}>
                                 This will select all the items in the Customers Collection which have LastName of
                                 "Hill" and FirstName of "Stephen".
                             </FunctionExample>
                             <FunctionExample name='Get' inputs={['Customers', '{}']}>
                                 This will select all the items in the Customers Collection.
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Random' id='Random' resultType='date'
                         description={<>
                             <Para>A Random number or other value generated in various ways.</Para>
                             <Para><em>Note:</em>If you want to do multiple calculations with the same random value,
                                 or keep it the same while other values on the same page are changing,
                                 you need to store the value in a Data element.</Para>
                             <NamedList>
                                 <NLItem name='No inputs'>
                                     <Para>A fractional random number between 0 and 1 (never actually 1)</Para>
                                 </NLItem>
                                 <NLItem name='Single number'>
                                     <Para>A random whole number between 0 and the number given (including 0 and the
                                         number given)</Para>
                                 </NLItem>
                                 <NLItem name='Multiple values'>
                                     <Para>One of the values, chosen at random</Para>
                                 </NLItem>
                                 <NLItem name='A single List of values'>
                                     <Para>One of the values in the list, chosen at random</Para></NLItem>
                             </NamedList>
                         </>
                         }

                         inputs={<>
                             <Para>Various - see the description above</Para>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Random' inputs={[]}>Example result: 0.7184023</FunctionExample>
                             <FunctionExample name='Random' inputs={['10']}>A random value between 0 and
                                 10</FunctionExample>
                             <FunctionExample name='Random' inputs={['10', '20', '30']}>Random choice from 10, 20 or
                                 30</FunctionExample>
                             <FunctionExample name='Random' inputs={['true', 'false']}>Random choice of true or
                                 false</FunctionExample>
                             <FunctionExample name='Random' inputs={['List("Red", "Green", "Blue")']}>Random choice from
                                 "Red", "Green" or "Blue"</FunctionExample>
                         </>}
        />

        <FunctionSection name='Record' id='Record' resultType='record'
                         description='Create a record from successive pairs of item name and value.'

                         inputs={
                             <FunctionInput name='Name Value Pairs' type='list'>A list of pairs of name and value. There
                                 must be an even number of arguments.
                                 The first argument and all other odd-numbered arguments are the names of the items, and
                                 they must be text.
                                 The second argument and the other even-numbered arguments are the values associated
                                 with the preceding name, and they can be any type of value.
                             </FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Record' inputs={['FirstName', '"Wayne"', 'LastName', '"Cheng"']}>
                                 This results in a record with two items: FirstName = "Wayne" and LastName = "Cheng"
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Remove' id='Remove' resultType='action'
                         description='Remove an item in a Collection, identified by id.'

                         inputs={<>
                             <FunctionInput name='Collection' type='Collection'>The Collection in which the item is to
                                 be removed.</FunctionInput>
                             <FunctionInput name='Id' type='Collection'>The id of the item to be
                                 removed.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Remove' inputs={['Customers', 'currentId']}>
                                 This will remove the item in the Customers Collection which has the id in 'currentId'.
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Reset' id='Reset' resultType='action'
                         description='Reset the value of an element to its initial value.'

                         inputs={
                             <FunctionInput name='Element' type='Element'>The element to reset.</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='Reset' inputs={['LastnameInput']}/>
                         </>}
        />

        <FunctionSection name='Right' id='Right' resultType='text'
                         description='Get part of a text value, from the end.'

                         inputs={<>
                             <FunctionInput name='Text' type='text'>The original text</FunctionInput>
                             <FunctionInput name='Length' type='number'>The number of characters to take from the end of
                                 Text.
                                 If this is more than the length of Text, the result is the whole of Text.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Right' inputs={['"abcde"', '3']}>Result: "cde"</FunctionExample>
                             <FunctionExample name='Right' inputs={['"abcde"', '6']}>Result: "abcde" (an empty
                                 text)</FunctionExample>
                             <FunctionExample name='Right' inputs={['"abcde"', '0']}>Result: "" (an empty
                                 text)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Round' id='Round' resultType='number'
                         description='Round a number to a certain number of digits'

                         inputs={<>
                             <FunctionInput name='Number' type='number'>The number to round.</FunctionInput>
                             <FunctionInput name='Decimal Digits' type='number' optional>The number of decimal digits to
                                 round to. If not given, assumes no decimal digits.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Round' inputs={['10.013', '2']}>Result: 10.01</FunctionExample>
                             <FunctionExample name='Round' inputs={['10.5']}>Result: 11</FunctionExample>
                         </>}
        />

        <FunctionSection name='Select' id='Select' resultType='list of any type'
                         description='Select the values from a list where a given condition is true.'

                         inputs={<>
                             <FunctionInput name='Values' type='list of any type'>The list of values to select
                                 from</FunctionInput>
                             <FunctionInput name='Condition' type='formula giving true-false'>Controls which of the
                                 values are included in the result.
                                 It is applied to each of Values in turn, and if it results in true, that value is
                                 included.
                                 It should use the special name <code>$item</code> to mean the item that is being
                                 checked.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Select' inputs={['List(50, 10, 20, 30, 40)', 'Gt($item, 25)']}>Result:
                                 list containing 50, 30, 40</FunctionExample>
                             <FunctionExample name='Select'
                                              inputs={['List("Andrew", "Bobo", "Candice", "Jo")', 'Gt($item.length, 5)']}>Result:
                                 list containing "Andrew", "Candice"</FunctionExample>
                             <FunctionExample name='Select' inputs={['List(50, 10, 20, 30, 40)', 'Gt($item, 100)']}>Result:
                                 empty list</FunctionExample>
                         </>}
        />

        <FunctionSection name='Set' id='Set' resultType='action'
                         description='Set the value of a Data element.  Any previous value is completely replaced.'

                         inputs={<>
                             <FunctionInput name='Element' type='Data Element'>The Data element in which the value is
                                 set.</FunctionInput>
                             <FunctionInput name='Value' type='anything'>The value to set.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Set' inputs={['NameToUse', 'NameInput']}/>
                         </>}
        />

        <FunctionSection name='ShowPage' id='ShowPage' resultType='action'
                         description='Shows one of the Pages in the App.'

                         inputs={
                             <FunctionInput name='Page' type='Page'>The Page to show. It must be the name of one of the
                                 Pages defined under the App.</FunctionInput>
                         }
                         examples={<>
                             <FunctionExample name='ShowPage' inputs={['UserPage']}/>
                         </>}
        />

        <FunctionSection name='Sort' id='Sort' resultType='list of any type'
                         description='Create a new list from the values in a given list, sorted according to the value from a formula applied to each value.'

                         inputs={<>
                             <FunctionInput name='Values' type='list of any type'>The starting list of
                                 values</FunctionInput>
                             <FunctionInput name='Formula' type='formula giving any type'>Calculates the sort value for
                                 each of the values in the result.
                                 The result list contains the original values sorted according to their sort value.
                                 It should use the special name <code>$item</code> to mean the item in the original list
                                 that it is being applied to.
                             </FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Sort' inputs={['List(50, 10, 20)', '$item)']}>Result: list
                                 containing 10, 20, 50</FunctionExample>
                             <FunctionExample name='Sort' inputs={['List(50, 10, 20)', '0 - $item)']}>Result: list
                                 containing 50, 20, 10</FunctionExample>
                             <FunctionExample name='Sort'
                                              inputs={['List("Andrew", "Bobo", "Candice", "Jo")', '$item.length']}>Result:
                                 list containing "Jo", "Bobo", "Andrew", "Candice"</FunctionExample>
                         </>}
        />

        <FunctionSection name='Sub' id='Sub' resultType='number or Decimal'
                         description='Subtract one or more numbers from the first number.  If any of the numbers is a Decimal, the result will be a Decimal'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The number the others are
                                 subtracted from.</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The first number to
                                 subtract.</FunctionInput>
                             <FunctionInput name='Number 3, 4, 5, etc...' type='number or Decimal' optional>Further
                                 numbers to subtract</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Sub' inputs={['60', '10']}>Result: 50 (60 - 10)</FunctionExample>
                             <FunctionExample name='Sub' inputs={['D(10)', '20', '30']}>Result: Decimal with a value of
                                 -40.0 (10 - 20 - 30)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Sum' id='Sum' resultType='number or Decimal'
                         description='Add together two or more numbers.  If any of the numbers is a Decimal, the result will be a Decimal'

                         inputs={<>
                             <FunctionInput name='First Number' type='number or Decimal'>The first number to
                                 add.</FunctionInput>
                             <FunctionInput name='Second Number' type='number or Decimal'>The second number to
                                 add.</FunctionInput>
                             <FunctionInput name='Number 3, 4, 5, etc...' type='number or Decimal' optional>Further
                                 numbers to add</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Sum' inputs={['10', '20', '30']}>Result: 60</FunctionExample>
                             <FunctionExample name='Sum' inputs={['D(10)', '20', '30']}>Result: Decimal with a value of
                                 60.0</FunctionExample>
                         </>}
        />


        <FunctionSection name='TimeBetween' id='TimeBetween' resultType='number'
                         description='Get the difference between two Date/Time values in various units.  If First Date is after Second Date, the answer will be a negative number.'

                         inputs={<>
                             <FunctionInput name='First Date' type='date'>The date expected to be
                                 earlier</FunctionInput>
                             <FunctionInput name='Second Date' type='date'>The date expected to be later</FunctionInput>
                             <FunctionInput name='Unit' type='text'>The units to get the difference in.
                                 One of: "seconds", "minutes", "hours", "days", "months", "years"</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='TimeBetween'
                                              inputs={['DateVal("2022-03-01")', 'DateVal("2022-07-01")', "months"]}>Result:
                                 4</FunctionExample>
                             <FunctionExample name='TimeBetween'
                                              inputs={['DateVal("2022-03-01T02:03:00")', 'DateVal("2022-03-01T02:04:00")', "seconds"]}>Result:
                                 60</FunctionExample>
                         </>}
        />

        <FunctionSection name='Timestamp' id='Timestamp' resultType='number'
                         description='A number representing the current time to the nearest millisecond'

                         inputs={<>
                             <Para>None</Para>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Timestamp' inputs={[]}>Result: 1695037211726 (the result is
                                 different every time)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Today' id='Today' resultType='Date'
                         description='The current date, at midnight UTC'

                         inputs={<>
                             <Para>None</Para>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Today' inputs={[]}>Result: 2022-03-04 100:00:00 (the result is
                                 different every time)</FunctionExample>
                         </>}
        />

        <FunctionSection name='Update (Data)' id='Update-Data' resultType='action'
                         description='Update the value of a Data element.  Any previous value is updated with the changes given,
                         and items not affected by the changes remain the same.
                         This only works if the Data element is storing a record value.'

                         inputs={<>
                             <FunctionInput name='Element' type='Data Element'>The Data element in which the value is
                                 set.</FunctionInput>
                             <FunctionInput name='Changes' type='record'>The changes to make to the current
                                 record.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Update'
                                              inputs={['Customer', '{Firstname: "Marcel", Surname: "Dupont"}']}>
                                 This will update the Firstname and Surname data items in the Customer Data element, but
                                 leave all the other data items the same.
                             </FunctionExample>
                         </>}
        />

        <FunctionSection name='Update (Collection)' id='Update-Collection' resultType='action'
                         description='Update the value of an item in a Collection, identified by id.  Any previous value is updated with the changes given,
                         and items not affected by the changes remain the same.
                         This only works if the Collection is storing record values.'

                         inputs={<>
                             <FunctionInput name='Collection' type='Collection'>The Collection in which the item is to
                                 be updated.</FunctionInput>
                             <FunctionInput name='Id' type='Collection'>The id of the item to be
                                 updated.</FunctionInput>
                             <FunctionInput name='Changes' type='record'>The changes to make to the current
                                 item.</FunctionInput>
                         </>
                         }
                         examples={<>
                             <FunctionExample name='Update'
                                              inputs={['Customers', 'currentId', '{Firstname: "Marcel", Surname: "Dupont"}']}>
                                 This will update the Firstname and Surname data items,
                                 of the item in the Customers Collection which has the id in 'currentId'.
                             </FunctionExample>
                         </>}
        />


    </Section>

