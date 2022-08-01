import Element from './Element'
import {PropertyType, PropertyValueType} from './Types'
import BaseInputElement from './BaseInputElement'
import ToggleOn from '@mui/icons-material/ToggleOn'

export type Properties = {
    readonly initialValue?: PropertyValueType<boolean>,
    readonly label?: PropertyValueType<string>
}
export default class TrueFalseInput extends BaseInputElement<Properties> implements Element {

    static get iconClass() { return ToggleOn }
    get valueType(): PropertyType { return 'boolean' }
}