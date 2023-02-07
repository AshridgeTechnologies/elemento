export const treeNodeSelector = '.rc-tree-list .rc-tree-node-content-wrapper'
export const treeItemTitleSelector = `${treeNodeSelector} .rc-tree-title`
export const treeExpandControlSelector = '.rc-tree-switcher'

export const treeWrapperSelector = '.rc-tree-list .rc-tree-node-content-wrapper'
export const treeItem = (index: number) => `${treeWrapperSelector} >> nth=${index}`
