import {callParent, observeParent} from './controllerHelpers'
import {loadJSON} from '../model/loadJSON'

export default class PreviewControllerClient {
    public SetOptions = callParent('Preview.SetOptions')
    public Show = callParent('Preview.Show')
    public Click = callParent('Preview.Click')
    public SetValue = callParent('Preview.SetValue')
    public GetValue = callParent('Preview.GetValue')
    public GetState = callParent('Preview.GetState')
    public GetTextContent = callParent('Preview.GetTextContent')
    public Debug = observeParent('Preview.Debug')
}

export const Preview = new PreviewControllerClient()
