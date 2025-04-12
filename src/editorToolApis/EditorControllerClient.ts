import {loadJSON} from '../model/loadJSON'
import {callRpc, observeRpc} from '../shared/rpcHelpers'

export default class EditorControllerClient {
    public SelectedItemId = observeRpc('Editor.SelectedItemId')
    public SelectedText = observeRpc('Editor.SelectedText')
    public Project = observeRpc('Editor.Project', loadJSON)
    public SetOptions = callRpc('Editor.SetOptions')
    public Show = callRpc('Editor.Show')
    public Click = callRpc('Editor.Click')
    public ContextClick = callRpc('Editor.ContextClick')
    public SetValue = callRpc('Editor.SetValue')
    public GetValue = callRpc('Editor.GetValue')
    public EnsureFormula = callRpc('Editor.EnsureFormula')
    public EnsureTreeItemsExpanded = callRpc('Editor.EnsureTreeItemsExpanded')
    public GetGitHubUrl = callRpc('Editor.GetGitHubUrl')
    public GetSettings = callRpc('Editor.GetSettings')
    public UpdateSettings = callRpc('Editor.UpdateSettings')
}

export const Editor = new EditorControllerClient()
