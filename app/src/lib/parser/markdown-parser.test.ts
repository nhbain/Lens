import { describe, it, expect } from 'vitest'
import { parseMarkdown } from './markdown-parser'
import type { Heading, List, ListItem } from 'mdast'

describe('parseMarkdown', () => {
  describe('basic parsing', () => {
    it('parses valid markdown and returns AST root', () => {
      const ast = parseMarkdown('# Hello World')

      expect(ast.type).toBe('root')
      expect(ast.children).toHaveLength(1)
    })

    it('returns empty root for empty string', () => {
      const ast = parseMarkdown('')

      expect(ast.type).toBe('root')
      expect(ast.children).toHaveLength(0)
    })

    it('handles whitespace-only content', () => {
      const ast = parseMarkdown('   \n\n   ')

      expect(ast.type).toBe('root')
      expect(ast.children).toHaveLength(0)
    })
  })

  describe('position data', () => {
    it('includes position info on root node', () => {
      const ast = parseMarkdown('# Header')

      expect(ast.position).toBeDefined()
      expect(ast.position?.start.line).toBe(1)
    })

    it('includes position info on child nodes', () => {
      const ast = parseMarkdown('# First\n\n## Second')
      const heading1 = ast.children[0] as Heading
      const heading2 = ast.children[1] as Heading

      expect(heading1.position?.start.line).toBe(1)
      expect(heading2.position?.start.line).toBe(3)
    })

    it('includes column position', () => {
      const ast = parseMarkdown('# Header')
      const heading = ast.children[0] as Heading

      expect(heading.position?.start.column).toBe(1)
    })
  })

  describe('GFM support', () => {
    it('parses task lists with unchecked items', () => {
      const ast = parseMarkdown('- [ ] Todo item')
      const list = ast.children[0] as List
      const item = list.children[0] as ListItem

      expect(item.checked).toBe(false)
    })

    it('parses task lists with checked items', () => {
      const ast = parseMarkdown('- [x] Done item')
      const list = ast.children[0] as List
      const item = list.children[0] as ListItem

      expect(item.checked).toBe(true)
    })

    it('parses mixed task list', () => {
      const markdown = `- [ ] First
- [x] Second
- [ ] Third`
      const ast = parseMarkdown(markdown)
      const list = ast.children[0] as List

      expect(list.children).toHaveLength(3)
      expect((list.children[0] as ListItem).checked).toBe(false)
      expect((list.children[1] as ListItem).checked).toBe(true)
      expect((list.children[2] as ListItem).checked).toBe(false)
    })
  })

  describe('complex documents', () => {
    it('parses document with headers, lists, and text', () => {
      const markdown = `# Main Header

Some introductory text.

## Sub Header

- Item 1
- Item 2

### Deep Header

1. Numbered item`

      const ast = parseMarkdown(markdown)

      // Should have multiple top-level children
      expect(ast.children.length).toBeGreaterThan(3)

      // Find headers
      const headers = ast.children.filter((n) => n.type === 'heading') as Heading[]
      expect(headers).toHaveLength(3)
      expect(headers[0].depth).toBe(1)
      expect(headers[1].depth).toBe(2)
      expect(headers[2].depth).toBe(3)

      // Find lists
      const lists = ast.children.filter((n) => n.type === 'list') as List[]
      expect(lists).toHaveLength(2)
      expect(lists[0].ordered).toBe(false)
      expect(lists[1].ordered).toBe(true)
    })
  })
})
