const runtimeUrl = `${window.location.origin}/runtime/runtime.js`
const Elemento = await import(runtimeUrl)
const {React} = Elemento

const {types: {ChoiceType, DateType, ListType, NumberType, DecimalType, RecordType, TextType, TrueFalseType, Rule}} = Elemento

// Types.js
const Types = (() => {
    const {Or} = Elemento.globalFunctions

    const AddressType = new RecordType('Address Type', {description: 'A UK postal address', required: false}, [], [
        new TextType('Address Line 1', {description: 'First line of the address, house name/number and street', required: true, minLength: 3, maxLength: 50}),
        new TextType('Address Line 2', {description: 'Second line of the address', required: false, minLength: 3, maxLength: 50}),
        new TextType('City', {description: 'The town or city', required: true, maxLength: 30}),
        new TextType('Postcode', {description: 'The full post code', required: false, minLength: 5, maxLength: 8}, [
            new Rule('Postcode format rule', $item => $item.match(/[A-Z][A-Z]?\d\d?[A-Z]? ?\d[A-Z][A-Z]/), {description: 'Must be a valid postcode'})
        ])
    ])
    const CustomerType = new RecordType('Customer Type', {required: false}, [
        new Rule('Balance within limit', $item => Or(!$item.OpeningBalance, ($item.OpeningBalance <= $item.CreditLimit)), {description: 'Opening Balance must be less than Credit Limit'})
    ], [
        new TextType('First Name', {required: true, minLength: 2, maxLength: 20}),
        new TextType('Last Name', {required: true, minLength: 2, maxLength: 30}),
        new DateType('Date Of First Order', {description: 'Must be after beginning of 2017', required: false, min: new Date('2017-01-01T00:00:00.000Z')}),
        new TrueFalseType('Existing Customer', {description: 'Is this a pre-merger customer?', required: false}),
        new ChoiceType('Region', {description: 'Sales region', required: true, values: ['North', 'South', 'Central'], valueNames: []}),
        new NumberType('Credit Limit', {description: 'Credit limit (£)', required: true, min: 100, max: 1000, format: 'integer'}),
        new DecimalType('Opening Balance', {description: 'Opening Balance', required: true, decimalPlaces: 2}),
        new RecordType('Invoice Address', {basedOn: AddressType, description: 'Purchasing department address', required: false}),
        new RecordType('Delivery Address', {basedOn: AddressType, description: 'Delivery location address', required: false})
    ])

    return {
        AddressType,
        CustomerType
    }
})()

// OverviewPage.js
function OverviewPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const NextButton_action = React.useCallback(() => {
        ShowPage(DataTypesPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Customer Database Example Project'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, `This example shows how you can build an app to store records in a database, using Data Types to define the fields and generate forms automatically.

On the left side of the page  you can see how it is built, and examine the elements that define what it does.  On the right hand side you can try out the preview of the app - add a new customer or update an existing one.  

Click the Help button above to find out more about anything in the example.

Go ahead and experiment with the app - just change anything you like and see what happens. If it all goes wrong, you can just download this example again and start over.`),
        React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    )
}

// DataTypesPage.js
function DataTypesPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(OverviewPage)
    }, [])
    const NextButton_action = React.useCallback(() => {
        ShowPage(DataTypesInterestingPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Data Types'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, `The app is based around definitions of the data it uses.  You can see these in the Navigator at the left of the page, under 'Types'.  

Customer and Address are record types that contain several simple fields.  If you expand each one and click each field in turn, you can see how the various settings define the types of data allowed.  The Data Types section in the Help explains a lot more.`),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    ),
    )
}

// DataTypesInterestingPage.js
function DataTypesInterestingPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(DataTypesPage)
    }, [])
    const NextButton_action = React.useCallback(() => {
        ShowPage(DataStoragePage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Data Types - Interesting Points'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, 'All Data Types have a Description and a Required property, but the other properties depend on the particular type.'),
        React.createElement(TextElement, {path: pathWith('Para2'), width: '100%'}, 'Customer Type, which is a Record Type, contains both simple types and another Record Type, Address Type.'),
        React.createElement(TextElement, {path: pathWith('Para3'), width: '100%'}, 'All types can contain Rules, which allow you to set any conditions for the data in that type.  The condition is a formula which must be true if the value is correct.  The Rule also has a Description which is displayed as an error message when necessary.'),
        React.createElement(TextElement, {path: pathWith('Para4'), width: '100%'}, `In Customer Type there is a rule called "Balance within limit" that does a cross-check between two field values.  
In Address Type, the Postcode field has a rule that defines the allowed format.  This rule is an example of how you can use almost any JavaScript expression if you need to,  and have someone who knows how to, so there are no artificial limits to what you can do.`),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    ),
    )
}

// DataStoragePage.js
function DataStoragePage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(DataTypesInterestingPage)
    }, [])
    const NextButton_action = React.useCallback(() => {
        ShowPage(CustomerListPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Data Storage'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, 'The customer records are managed by a collection called Customers.  The collection is connected to a backing store, Data Store.'),
        React.createElement(TextElement, {path: pathWith('Para2'), width: '100%'}, 'There are various types of data store available in Elemento - this one is a Browser Data Store.  It stores data in the IndexedDB local database provided by the browser.'),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    ),
    )
}

// CustomerListPage.js
function CustomerListPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(DataStoragePage)
    }, [])
    const NextButton_action = React.useCallback(() => {
        ShowPage(FormPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Customer List'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, 'Expand Main Page and the elements under it until you find Customer List.  This shows the list of Customers on the left of the app page.'),
        React.createElement(TextElement, {path: pathWith('Para2'), width: '100%'}, 'The list\'s Items property is set to a formula that gets all the items from the Customer collection, and sorts them by Last Name.'),
        React.createElement(TextElement, {path: pathWith('Para3'), width: '100%'}, 'The list contains a Text element that is repeated for each item.  Its content is a formula that joins the Last Name and First Name together.'),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    ),
    )
}

// FormPage.js
function FormPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(CustomerListPage)
    }, [])
    const NextButton_action = React.useCallback(() => {
        ShowPage(FormsInterestingPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Forms'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, 'Expand Main Page and the elements under it until you find Customer Form.  You can define a form by adding elements manually, but here we set the Data Type property to automatically generate the fields.'),
        React.createElement(TextElement, {path: pathWith('Para2'), width: '100%'}, 'The form\'s Initial Value property has a formula which refers to the CustomerList element\'s selected value.  This makes the form show the item selected in the list.'),
        React.createElement(TextElement, {path: pathWith('Para3')}, 'To show an empty form for entering a new customer, the New Customer button simply resets the Customer List to have no item selected.'),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    ),
    )
}

// FormsInterestingPage.js
function FormsInterestingPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(FormPage)
    }, [])
    const NextButton_action = React.useCallback(() => {
        ShowPage(FinishPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'Forms - Interesting Points'),
        React.createElement(TextElement, {path: pathWith('Para1'), width: '100%'}, 'The Description and Required properties of the Data Type create a help tooltip and a required marker on the form field.'),
        React.createElement(TextElement, {path: pathWith('Para2'), width: '100%'}, 'Error messages are displayed if you enter an invalid value, or leave a required field without entering a value.'),
        React.createElement(TextElement, {path: pathWith('Para3'), width: '100%'}, `The form has a manually defined element, Form error messages, which is displayed after the elements generated from the Data Type.
This element uses a formula to display the form-level error messages.`),
        React.createElement(TextElement, {path: pathWith('Para3a'), width: '100%'}, `Theres is also an element, All error messages, which is hidden by having Display set to No.
This element uses a formula to display all the error messages, and can be set to Display Yes to help with debugging.`),
        React.createElement(TextElement, {path: pathWith('Para4'), width: '100%'}, 'Only one of the Add and Save buttons with the form is displayed, depending on whether you are editing a new customer or an existing one.  The buttons are only enabled when the form is valid and has been modified.'),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('NextButton'), content: 'Next', appearance: 'outline', action: NextButton_action}),
    ),
    )
}

// FinishPage.js
function FinishPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button} = Elemento.components
    const {Editor, Preview} = Elemento
    const app = Elemento.useGetObjectState('app')
    const {ShowPage} = app
    const BackButton_action = React.useCallback(() => {
        ShowPage(FormsInterestingPage)
    }, [])
    const GotoStartButton_action = React.useCallback(() => {
        ShowPage(OverviewPage)
    }, [])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 24}, 'That\'s it!'),
        React.createElement(TextElement, {path: pathWith('Para1')}, 'OK - that\'s the end of the tour.  Thanks for following along to the end.'),
        React.createElement(TextElement, {path: pathWith('Para2')}, 'To find out more, you can use the Help page here in the Studio, or try some of the other resources at https://elemento.online/learn'),
        React.createElement(Layout, {path: pathWith('Layout4'), horizontal: true, wrap: false},
            React.createElement(Button, {path: pathWith('BackButton'), content: 'Back', appearance: 'outline', action: BackButton_action}),
            React.createElement(Button, {path: pathWith('GotoStartButton'), content: 'Go to Start', appearance: 'outline', action: GotoStartButton_action}),
    ),
    )
}

// QuickTour.js
export default function QuickTour(props) {
    const pathWith = name => 'QuickTour' + '.' + name
    const {App} = Elemento.components
    const {Editor, Preview} = Elemento
    const pages = {OverviewPage, DataTypesPage, DataTypesInterestingPage, DataStoragePage, CustomerListPage, FormPage, FormsInterestingPage, FinishPage}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))

    return React.createElement(App, {path: 'QuickTour', maxWidth: '60em', showWhenProjectOpened: true,},)
}
