const runtimeUrl = `${window.location.origin}/runtime/runtime.js`
const Elemento = await import(runtimeUrl)
const {React} = Elemento
const {importModule, importHandlers} = Elemento
const InitialData = await import('../files/InitialData.js').then(...importHandlers())

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

// MainPage.js
function MainPage_CustomerListItem(props) {
    const pathWith = name => props.path + '.' + name
    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name
    const {$item} = props
    const {TextElement} = Elemento.components

    return React.createElement(React.Fragment, null,
        React.createElement(TextElement, {path: pathWith('CustomerListItem')}, $item.LastName + ", " + $item.FirstName),
    )
}


function MainPage_CustomerForm(props) {
    const pathWith = name => props.path + '.' + name
    const {Form, TextElement} = Elemento.components
    const $form = Elemento.useGetObjectState(props.path)

    $form._updateValue()

    return React.createElement(Form, props,
        React.createElement(TextElement, {path: pathWith('Allerrormessages'), display: true, fontSize: 13, color: 'red'}, $form.errors),
        React.createElement(TextElement, {path: pathWith('Formerrormessages'), fontSize: 13, color: 'red'}, $form.errors?._self),
    )
}


MainPage_CustomerForm.State = class MainPage_CustomerForm_State extends Elemento.components.BaseFormState {
    ownFieldNames = []
}


function MainPage(props) {
    const pathWith = name => props.path + '.' + name
    const {Page, TextElement, Layout, Button, ListElement} = Elemento.components
    const {Sort, Not, And} = Elemento.globalFunctions
    const {Update, Add} = Elemento.appFunctions
    const Customers = Elemento.useGetObjectState('app.Customers')
    const CustomerList = Elemento.useObjectState(pathWith('CustomerList'), new ListElement.State({}))
    const CustomerForm = Elemento.useObjectState(pathWith('CustomerForm'), new MainPage_CustomerForm.State({value: CustomerList.selectedItem, dataType: Types.CustomerType}))
    const NewButton_action = React.useCallback(() => {
        CustomerList.Reset()
        CustomerForm.Reset()
    }, [CustomerList, CustomerForm])
    const CustomerList_selectAction = React.useCallback(($item) => {
        CustomerForm.Reset()
    }, [CustomerForm])
    const SaveButton_action = React.useCallback(() => {
    const doAction = async () => {
        await Update(Customers, CustomerList.selectedItem.id, CustomerForm.value)
        CustomerForm.Reset()
    }
    doAction()
    }, [CustomerList, CustomerForm])
    const AddButton_action = React.useCallback(() => {
    const doAction = async () => {
        let newItem = await Add(Customers, CustomerForm.value)
        CustomerList.Set(newItem)
        CustomerForm.Reset()
    }
    doAction()
    }, [CustomerForm, CustomerList])

    return React.createElement(Page, {id: props.path},
        React.createElement(TextElement, {path: pathWith('Title'), fontSize: 26}, 'Customer Database'),
        React.createElement(Layout, {path: pathWith('PageLayout'), horizontal: true, width: '100%', wrap: false},
            React.createElement(Layout, {path: pathWith('ListLayout'), horizontal: false, width: '30%', wrap: false},
            React.createElement(Button, {path: pathWith('NewButton'), content: 'New Customer', appearance: 'outline', action: NewButton_action}),
            React.createElement(ListElement, {path: pathWith('CustomerList'), itemContentComponent: MainPage_CustomerListItem, items: Sort(Customers.Query({}), $item => $item.LastName), width: '100%', selectable: true, selectAction: CustomerList_selectAction}),
    ),
            React.createElement(Layout, {path: pathWith('CustomerDetailsLayout'), horizontal: false, width: '70%', wrap: false},
            React.createElement(MainPage_CustomerForm, {path: pathWith('CustomerForm'), label: 'Customer Details', horizontal: false, wrap: false}),
            React.createElement(Button, {path: pathWith('SaveButton'), content: 'Save', appearance: 'outline', display: CustomerList.selectedItem, enabled: CustomerForm.valid && CustomerForm.modified, action: SaveButton_action}),
            React.createElement(Button, {path: pathWith('AddButton'), content: 'Add', appearance: 'outline', display: Not(CustomerList.selectedItem), enabled: And(CustomerForm.valid, CustomerForm.modified), action: AddButton_action}),
    ),
    ),
    )
}

// appMain.js
export default function CustomerApp(props) {
    const pathWith = name => 'CustomerApp' + '.' + name
    const {App, BrowserDataStore, Collection} = Elemento.components
    const pages = {MainPage}
    const {appContext} = props
    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))
    const DataStore = Elemento.useObjectState('app.DataStore', new BrowserDataStore.State({databaseName: 'CustomerExample', collectionNames: ['Customers']}))
    const Customers = Elemento.useObjectState('app.Customers', new Collection.State({dataStore: DataStore, collectionName: 'Customers'}))
    const CustomerApp_startupAction = React.useCallback(() => {
    const doAction = async () => {
        let existingCustomers = await Customers.Query({})
        existingCustomers.length === 0 && DataStore.addAll('Customers', InitialData())
    }
    doAction()
    }, [Customers, DataStore])

    return React.createElement(App, {path: 'CustomerApp', author: 'pb12', startupAction: CustomerApp_startupAction,},
        React.createElement(Collection, {path: pathWith('Customers'), display: false})
    )
}
