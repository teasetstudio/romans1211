import { EditorView } from "@tiptap/pm/view";
import { TLinkData } from "../LinkMenu";

export const getLinkDataFromPos = (view: EditorView, pos: number) => {
  // Resolve the position in the document
  const resolvedPos = view.state.doc.resolve(pos);

  const parentNode = resolvedPos.node(resolvedPos.depth);
  const parentStart = resolvedPos.start(resolvedPos.depth);
  const { top, left } = view.coordsAtPos(pos)

  let linkData: TLinkData = {
    isCreatingLink: true,
    menuPosition: { x: left, y: top + 20 },
  }
  // GET data of the clicked link
  parentNode.forEach((child, offset) => {
    const linkMark = child.marks.find((mark) => mark.type.name === 'link')
    if (child.type.name === 'text' && linkMark) {
      const itemFrom = parentStart + offset
      const itemTo = itemFrom + child.nodeSize
      if (pos >= itemFrom && pos <= itemTo) {
        linkData = {
          isCreatingLink: false,
          clickPos: pos,
          linkStartFrom: itemFrom,
          linkEndTo: itemTo,
          linkText: child.text || '',
          linkUrl: linkMark.attrs.href,
          menuPosition: linkData.menuPosition,
        }
      }
    }
  })

  return linkData
}