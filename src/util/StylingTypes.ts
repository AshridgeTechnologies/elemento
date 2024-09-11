import {PropertyType} from '../model/Types'

export const commonStylingPropTypes: {[p: string]: PropertyType} = {
    background: 'string',
    backgroundAttachment: 'string',
    backgroundColor: 'string',
    backgroundImage: 'string',
    border: 'string',
    borderBottom: 'string',
    borderColor: 'string',
    borderLeft: 'string',
    borderRadius: 'string',
    borderRight: 'string',
    borderSpacing: 'string',
    borderStyle: ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'ridge', 'inset', 'outset', 'hidden'],
    borderTop: 'string',
    borderWidth: 'string',
    bottom: 'string',
    boxShadow: 'string',
    color: 'string',
    cursor: ['auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait', 'cell', 'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'grab', 'grabbing', 'e-resize', 'n-resize', 'ne-resize', 'nw-resize', 's-resize', 'se-resize', 'sw-resize', 'w-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'col-resize', 'row-resize', 'all-scroll', 'zoom-in', 'zoom-out'],
    display: ['inline', 'block', 'inline-block', 'none', 'revert'],
    flex: 'string',
    font: 'string',
    fontFamily: 'string',
    fontSize: 'string',
    fontWeight: ['normal', 'bold', 'lighter', 'bolder', 'revert'],
    height: 'string',
    left: 'string',
    lineHeight: 'string',
    listStyle: 'string',
    margin: 'string',
    marginBottom: 'string',
    marginLeft: 'string',
    marginRight: 'string',
    marginTop: 'string',
    maxHeight: 'string',
    maxWidth: 'string',
    minHeight: 'string',
    minWidth: 'string',
    opacity: 'string',
    outline: 'string',
    outlineColor: 'string',
    outlineOffset: 'string',
    outlineWidth: 'string',
    overflow: ['auto', 'visible', 'hidden', 'clip', 'scroll', 'revert'],
    padding: 'string',
    paddingBottom: 'string',
    paddingLeft: 'string',
    paddingRight: 'string',
    paddingTop: 'string',
    position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
    right: 'string',
    rotate: 'string',
    scale: 'string',
    textAlign: ['start', 'end', 'left', 'right', 'center', 'justify', 'justify-all', 'match-parent', 'revert'],
    textDecoration: 'string',
    top: 'string',
    translate: 'string',
    verticalAlign: 'string',
    visibility: ['visible', 'hidden', 'revert'],
    whiteSpace: ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces', 'revert'],
    width: 'string',
    zIndex: 'number'
} as const

export const commonStylingPropNames = Object.keys(commonStylingPropTypes)

export const defaultUnits = {
    borderRadius: 'px',
    borderSpacing: 'px',
    borderWidth: 'px',
    bottom: 'px',
    fontSize: 'px',
    height: 'px',
    left: 'px',
    margin: 'px',
    marginBottom: 'px',
    marginLeft: 'px',
    marginRight: 'px',
    marginTop: 'px',
    maxHeight: 'px',
    maxWidth: 'px',
    minHeight: 'px',
    minWidth: 'px',
    outlineOffset: 'px',
    outlineWidth: 'px',
    padding: 'px',
    paddingLeft: 'px',
    paddingRight: 'px',
    paddingTop: 'px',
    paddingBottom: 'px',
    right: 'px',
    rotate: 'deg',
    top: 'px',
    width: 'px',
}

export const allStylingProps = [
'accentColor',
'alignContent',
'alignItems',
'alignSelf',
'all',
'animation',
'animationDelay',
'animationDirection',
'animationDuration',
'animationFillMode',
'animationIterationCount',
'animationName',
'animationPlayState',
'animationTimingFunction',
'aspectRatio',
'backdropFilter',
'backfaceVisibility',
'background',
'backgroundAttachment',
'backgroundBlendMode',
'backgroundClip',
'backgroundColor',
'backgroundImage',
'backgroundOrigin',
'backgroundPosition',
'backgroundPositionX',
'backgroundPositionY',
'backgroundRepeat',
'backgroundSize',
'blockSize',
'border',
'borderBlock',
'borderBlockColor',
'borderBlockEnd',
'borderBlockEndColor',
'borderBlockEndStyle',
'borderBlockEndWidth',
'borderBlockStart',
'borderBlockStartColor',
'borderBlockStartStyle',
'borderBlockStartWidth',
'borderBlockStyle',
'borderBlockWidth',
'borderBottom',
'borderBottomColor',
'borderBottomLeftRadius',
'borderBottomRightRadius',
'borderBottomStyle',
'borderBottomWidth',
'borderCollapse',
'borderColor',
'borderEndEndRadius',
'borderEndStartRadius',
'borderImage',
'borderImageOutset',
'borderImageRepeat',
'borderImageSlice',
'borderImageSource',
'borderImageWidth',
'borderInline',
'borderInlineColor',
'borderInlineEnd',
'borderInlineEndColor',
'borderInlineEndStyle',
'borderInlineEndWidth',
'borderInlineStart',
'borderInlineStartColor',
'borderInlineStartStyle',
'borderInlineStartWidth',
'borderInlineStyle',
'borderInlineWidth',
'borderLeft',
'borderLeftColor',
'borderLeftStyle',
'borderLeftWidth',
'borderRadius',
'borderRight',
'borderRightColor',
'borderRightStyle',
'borderRightWidth',
'borderSpacing',
'borderStartEndRadius',
'borderStartStartRadius',
'borderStyle',
'borderTop',
'borderTopColor',
'borderTopLeftRadius',
'borderTopRightRadius',
'borderTopStyle',
'borderTopWidth',
'borderWidth',
'bottom',
'boxDecorationBreak',
'boxReflect',
'boxShadow',
'boxSizing',
'breakAfter',
'breakBefore',
'breakInside',
'captionSide',
'caretColor',
'clear',
'clip',
'clipPath',
'color',
'columnCount',
'columnFill',
'columnGap',
'columnRule',
'columnRuleColor',
'columnRuleStyle',
'columnRuleWidth',
'columnSpan',
'columnWidth',
'columns',
'content',
'counterIncrement',
'counterReset',
'counterSet',
'cursor',
'direction',
'display',
'emptyCells',
'filter',
'flex',
'flexBasis',
'flexDirection',
'flexFlow',
'flexGrow',
'flexShrink',
'flexWrap',
'float',
'font',
'fontFamily',
'fontFeatureSettings',
'fontKerning',
'fontSize',
'fontSizeAdjust',
'fontStretch',
'fontStyle',
'fontVariant',
'fontVariantCaps',
'fontWeight',
'gap',
'grid',
'gridArea',
'gridAutoColumns',
'gridAutoFlow',
'gridAutoRows',
'gridColumn',
'gridColumnEnd',
'gridColumnGap',
'gridColumnStart',
'gridGap',
'gridRow',
'gridRowEnd',
'gridRowGap',
'gridRowStart',
'gridTemplate',
'gridTemplateAreas',
'gridTemplateColumns',
'gridTemplateRows',
'hangingPunctuation',
'height',
'hyphens',
'hyphenateCharacter',
'imageRendering',
'inlineSize',
'inset',
'insetBlock',
'insetBlockEnd',
'insetBlockStart',
'insetInline',
'insetInlineEnd',
'insetInlineStart',
'isolation',
'justifyContent',
'justifyItems',
'justifySelf',
'left',
'letterSpacing',
'lineHeight',
'listStyle',
'listStyleImage',
'listStylePosition',
'listStyleType',
'margin',
'marginBlock',
'marginBlockEnd',
'marginBlockStart',
'marginBottom',
'marginInline',
'marginInlineEnd',
'marginInlineStart',
'marginLeft',
'marginRight',
'marginTop',
'maskImage',
'maskMode',
'maskOrigin',
'maskPosition',
'maskRepeat',
'maskSize',
'maxBlockSize',
'maxHeight',
'maxInlineSize',
'maxWidth',
'minBlockSize',
'minInlineSize',
'minHeight',
'minWidth',
'mixBlendMode',
'objectFit',
'objectPosition',
'offset',
'offsetAnchor',
'offsetDistance',
'offsetPath',
'offsetRotate',
'opacity',
'order',
'orphans',
'outline',
'outlineColor',
'outlineOffset',
'outlineStyle',
'outlineWidth',
'overflow',
'overflowAnchor',
'overflowWrap',
'overflowX',
'overflowY',
'overscrollBehavior',
'overscrollBehaviorBlock',
'overscrollBehaviorInline',
'overscrollBehaviorX',
'overscrollBehaviorY',
'padding',
'paddingBlock',
'paddingBlockEnd',
'paddingBlockStart',
'paddingBottom',
'paddingInline',
'paddingInlineEnd',
'paddingInlineStart',
'paddingLeft',
'paddingRight',
'paddingTop',
'pageBreakAfter',
'pageBreakBefore',
'pageBreakInside',
'paintOrder',
'perspective',
'perspectiveOrigin',
'placeContent',
'placeItems',
'placeSelf',
'pointerEvents',
'position',
'quotes',
'resize',
'right',
'rotate',
'rowGap',
'scale',
'scrollBehavior',
'scrollMargin',
'scrollMarginBlock',
'scrollMarginBlockEnd',
'scrollMarginBlockStart',
'scrollMarginBottom',
'scrollMarginInline',
'scrollMarginInlineEnd',
'scrollMarginInlineStart',
'scrollMarginLeft',
'scrollMarginRight',
'scrollMarginTop',
'scrollPadding',
'scrollPaddingBlock',
'scrollPaddingBlockEnd',
'scrollPaddingBlockStart',
'scrollPaddingBottom',
'scrollPaddingInline',
'scrollPaddingInlineEnd',
'scrollPaddingInlineStart',
'scrollPaddingLeft',
'scrollPaddingRight',
'scrollPaddingTop',
'scrollSnapAlign',
'scrollSnapStop',
'scrollSnapType',
'scrollbarColor',
'tabSize',
'tableLayout',
'textAlign',
'textAlignLast',
'textDecoration',
'textDecorationColor',
'textDecorationLine',
'textDecorationStyle',
'textDecorationThickness',
'textEmphasis',
'textEmphasisColor',
'textEmphasisPosition',
'textEmphasisStyle',
'textIndent',
'textJustify',
'textOrientation',
'textOverflow',
'textShadow',
'textTransform',
'textUnderlineOffset',
'textUnderlinePosition',
'textWrap',
'textWrapMode',
'textWrapStyle',
'top',
'transform',
'transformOrigin',
'transformStyle',
'transition',
'transitionDelay',
'transitionDuration',
'transitionProperty',
'transitionTimingFunction',
'translate',
'unicodeBidi',
'userSelect',
'verticalAlign',
'visibility',
'whiteSpace',
'widows',
'width',
'wordBreak',
'wordSpacing',
'wordWrap',
'writingMode',
'zIndex'
] as const

export type StylingProp = typeof allStylingProps[number]

