import {callParent, observeParent} from './controllerHelpers'
import {loadJSON} from '../model/loadJSON'

export default class EditorControllerClient {
    public SelectedItemId = observeParent('Editor.SelectedItemId')
    public SelectedText = observeParent('Editor.SelectedText')
    public Project = observeParent('Editor.Project', loadJSON)
    public SetOptions = callParent('Editor.SetOptions')
    public Show = callParent('Editor.Show')
    public Click = callParent('Editor.Click')
    public ContextClick = callParent('Editor.ContextClick')
    public SetValue = callParent('Editor.SetValue')
    public GetValue = callParent('Editor.GetValue')
    public EnsureFormula = callParent('Editor.EnsureFormula')
    public EnsureTreeItemsExpanded = callParent('Editor.EnsureTreeItemsExpanded')
    public GetGitHubUrl = callParent('Editor.GetGitHubUrl')
    public GetSettings = callParent('Editor.GetSettings')
    public UpdateSettings = callParent('Editor.UpdateSettings')
}

export const Editor = new EditorControllerClient()
