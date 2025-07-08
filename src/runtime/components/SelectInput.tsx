import {createElement as el, FocusEvent} from 'react'
import {FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {ChoiceType} from '../types'
import {
    BaseInputComponentProperties,
    getLabelWithRequired,
    inputElementProps,
    propsForInputComponent,
    sxPropsForFormControl
} from './ComponentHelpers'
import {useObject} from '../appStateHooks'

type Properties = BaseInputComponentProperties & {values?: PropVal<string[]>}

export default function SelectInput({path, ...props}: Properties) {
    const {label, values: valuesFromProps = [], readOnly, show, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show, {minWidth: 120, flex: 0})

    const state = useObject<SelectInputState>(path)
    const {value, dataType} = state
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputProps = inputElementProps(styles, readOnly, {})

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: SelectChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state._setBlurred()

    const labelId = path + '_label'
    const noSelectionItem = el(MenuItem, {value: ''}, el('em', null, 'None'))
    const values = (valuesFromProps?.length ? valuesFromProps : dataType?.values) ?? []
    const menuItems = [noSelectionItem, ...values.map((v: any) => el(MenuItem, {key: v, value: v}, v))]

    return el(FormControl, {
            variant: 'filled',
            size: 'small',
            sx,
            error
        },
        el(InputLabel, {id: labelId}, labelWithRequired),
        el(Select, {
            labelId,
            id: path,
            value,
            // @ts-ignore
            onChange,
            onBlur,
            ...inputProps,
            ...inputComponentProps.InputProps,
        }, ...menuItems),
        el(FormHelperText, {}, helperText)
    )
}

export class SelectInputState extends InputComponentState<string, ChoiceType> {
    defaultValue = ''
}

SelectInput.State = SelectInputState
