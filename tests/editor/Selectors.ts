export const treeNodeSelector = '.rc-tree-list .rc-tree-treenode'
export const treeWrapperSelector = '.rc-tree-list .rc-tree-node-content-wrapper'
export const treeItemTitleSelector = `${treeWrapperSelector} .rc-tree-title`

export const treeExpandControlSelector = '.rc-tree-switcher'
export const treeItem = (index: number) => `${treeWrapperSelector} >> nth=${index}`
