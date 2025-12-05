/**
 * Core markdown parsing functionality using remark.
 * Parses markdown content into an AST for further processing.
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Root } from 'mdast'

/**
 * Pre-configured remark processor with GFM support.
 * Includes GitHub Flavored Markdown for task lists, tables, etc.
 */
const processor = unified().use(remarkParse).use(remarkGfm)

/**
 * Parses markdown content into an mdast AST.
 *
 * @param content - Raw markdown string to parse
 * @returns Root AST node containing the parsed document structure
 *
 * @example
 * ```ts
 * const ast = parseMarkdown('# Hello World')
 * // ast.children[0].type === 'heading'
 * ```
 */
export function parseMarkdown(content: string): Root {
  return processor.parse(content)
}

/**
 * Re-export types that consumers might need when working with the AST.
 */
export type { Root, Heading, List, ListItem, Paragraph, Text } from 'mdast'
