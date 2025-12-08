/**
 * AST traversal and item extraction logic.
 * Walks the markdown AST to extract trackable items with hierarchy.
 */

import type { Root, Heading, List, ListItem, PhrasingContent, Text, InlineCode } from 'mdast'
import type { TrackableItem, TrackableItemType, ParsedDocument, Position } from './types'

/**
 * Generates a stable ID for a trackable item based on position and content.
 * Uses a simple hash to create reproducible IDs.
 */
function generateId(position: Position, content: string, type: TrackableItemType): string {
  const str = `${type}:${position.line}:${position.column}:${content}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Extracts text content from mdast phrasing content nodes.
 */
function extractText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return (node as Text).value
      }
      if (node.type === 'inlineCode') {
        return (node as InlineCode).value
      }
      if ('children' in node && Array.isArray(node.children)) {
        return extractText(node.children as PhrasingContent[])
      }
      return ''
    })
    .join('')
}

/**
 * Calculates the end position for an item, considering its children.
 * If the item has children, returns the end position of the last descendant.
 * Otherwise, returns the item's own end position.
 */
function calculateEndPosition(
  itemEndLine: number,
  itemEndColumn: number,
  children: TrackableItem[]
): { endLine: number; endColumn: number } {
  if (children.length === 0) {
    return { endLine: itemEndLine, endColumn: itemEndColumn }
  }

  // Find the last child (considering nested children recursively)
  const lastChild = children[children.length - 1]
  if (lastChild.position.endLine !== undefined && lastChild.position.endColumn !== undefined) {
    return {
      endLine: lastChild.position.endLine,
      endColumn: lastChild.position.endColumn,
    }
  }

  // Fallback to item's own end position if children don't have end positions
  return { endLine: itemEndLine, endColumn: itemEndColumn }
}

/**
 * Extracts trackable items from list items recursively.
 */
function extractListItems(
  listNode: List,
  depth: number = 0
): TrackableItem[] {
  const items: TrackableItem[] = []

  for (const listItem of listNode.children as ListItem[]) {
    const position: Position = {
      line: listItem.position?.start.line ?? 0,
      column: listItem.position?.start.column ?? 0,
      endLine: listItem.position?.end.line ?? 0,
      endColumn: listItem.position?.end.column ?? 0,
    }

    // Extract text from paragraph children
    let content = ''
    const nestedLists: List[] = []

    for (const child of listItem.children) {
      if (child.type === 'paragraph') {
        content = extractText(child.children as PhrasingContent[])
      } else if (child.type === 'list') {
        nestedLists.push(child as List)
      }
    }

    // Determine if this is a checkbox or regular list item
    const isCheckbox = listItem.checked !== null && listItem.checked !== undefined
    const type: TrackableItemType = isCheckbox ? 'checkbox' : 'listItem'

    const item: TrackableItem = {
      id: generateId(position, content, type),
      type,
      content,
      depth,
      position,
      ordered: listNode.ordered ?? false,
      children: [],
    }

    // Add checked state for checkboxes
    if (isCheckbox) {
      item.checked = listItem.checked ?? false
    }

    // Recursively extract nested list items
    for (const nestedList of nestedLists) {
      item.children.push(...extractListItems(nestedList, depth + 1))
    }

    // Update end position to include children if present
    const endPos = calculateEndPosition(
      position.endLine ?? 0,
      position.endColumn ?? 0,
      item.children
    )
    item.position.endLine = endPos.endLine
    item.position.endColumn = endPos.endColumn

    items.push(item)
  }

  return items
}

/**
 * Extracts all trackable items from a markdown AST.
 *
 * @param ast - The root AST node from parseMarkdown
 * @returns Array of trackable items in document order
 */
export function extractItems(ast: Root): TrackableItem[] {
  const items: TrackableItem[] = []

  // First pass: collect headers and top-level lists
  for (const node of ast.children) {
    if (node.type === 'heading') {
      const heading = node as Heading
      const content = extractText(heading.children as PhrasingContent[])
      const position: Position = {
        line: heading.position?.start.line ?? 0,
        column: heading.position?.start.column ?? 0,
        endLine: heading.position?.end.line ?? 0,
        endColumn: heading.position?.end.column ?? 0,
      }

      items.push({
        id: generateId(position, content, 'header'),
        type: 'header',
        content,
        depth: heading.depth,
        position,
        children: [],
      })
    } else if (node.type === 'list') {
      items.push(...extractListItems(node as List, 0))
    }
  }

  return items
}

/**
 * Builds a hierarchical tree from flat items.
 * Headers contain subsequent items until the next header of same or higher level.
 */
export function buildTree(items: TrackableItem[]): TrackableItem[] {
  if (items.length === 0) return []

  const tree: TrackableItem[] = []
  const headerStack: TrackableItem[] = []

  for (const item of items) {
    // Deep clone to avoid mutating original
    const clonedItem: TrackableItem = {
      ...item,
      position: { ...item.position },
      children: [...item.children],
    }

    if (item.type === 'header') {
      // Pop headers of same or lower level (higher number)
      while (
        headerStack.length > 0 &&
        headerStack[headerStack.length - 1].depth >= item.depth
      ) {
        // Update popped header's end position to include its children
        const poppedHeader = headerStack.pop()!
        if (poppedHeader.children.length > 0) {
          const lastChild = poppedHeader.children[poppedHeader.children.length - 1]
          if (lastChild.position.endLine !== undefined && lastChild.position.endColumn !== undefined) {
            poppedHeader.position.endLine = lastChild.position.endLine
            poppedHeader.position.endColumn = lastChild.position.endColumn
          }
        }
      }

      if (headerStack.length === 0) {
        // Top-level header
        tree.push(clonedItem)
      } else {
        // Child of current header
        headerStack[headerStack.length - 1].children.push(clonedItem)
      }

      headerStack.push(clonedItem)
    } else {
      // List item or checkbox
      if (headerStack.length > 0) {
        // Add to current header's children
        headerStack[headerStack.length - 1].children.push(clonedItem)
      } else {
        // No header context, add to root
        tree.push(clonedItem)
      }
    }
  }

  // Update end positions for any remaining headers in the stack
  for (const header of headerStack) {
    if (header.children.length > 0) {
      const lastChild = header.children[header.children.length - 1]
      if (lastChild.position.endLine !== undefined && lastChild.position.endColumn !== undefined) {
        header.position.endLine = lastChild.position.endLine
        header.position.endColumn = lastChild.position.endColumn
      }
    }
  }

  return tree
}

/**
 * Flattens a tree of items back to a flat array (depth-first).
 */
export function flattenTree(tree: TrackableItem[]): TrackableItem[] {
  const result: TrackableItem[] = []

  function traverse(items: TrackableItem[]) {
    for (const item of items) {
      result.push(item)
      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(tree)
  return result
}

/**
 * Parses markdown content and returns a ParsedDocument.
 *
 * @param content - Raw markdown string
 * @param sourcePath - Optional path to the source file
 * @returns ParsedDocument with both flat items and hierarchical tree
 */
export function parseDocument(
  ast: Root,
  sourcePath?: string
): ParsedDocument {
  const items = extractItems(ast)
  const tree = buildTree(items)

  return {
    sourcePath,
    items,
    tree,
    parsedAt: new Date(),
    itemCount: items.length,
  }
}
