import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Root, Heading, List, ListItem } from 'mdast'

const parser = unified().use(remarkParse).use(remarkGfm)

describe('Remark POC', () => {
  it('parses markdown to AST', () => {
    const markdown = '# Hello World'
    const ast = parser.parse(markdown) as Root

    expect(ast.type).toBe('root')
    expect(ast.children).toHaveLength(1)
    expect(ast.children[0].type).toBe('heading')
  })

  it('includes position info on nodes', () => {
    const markdown = '# Header\n\nSome text'
    const ast = parser.parse(markdown) as Root
    const heading = ast.children[0] as Heading

    expect(heading.position).toBeDefined()
    expect(heading.position?.start.line).toBe(1)
    expect(heading.position?.start.column).toBe(1)
  })

  it('parses headers with correct depth', () => {
    const markdown = '# H1\n## H2\n### H3'
    const ast = parser.parse(markdown) as Root

    const headings = ast.children.filter((n) => n.type === 'heading') as Heading[]
    expect(headings).toHaveLength(3)
    expect(headings[0].depth).toBe(1)
    expect(headings[1].depth).toBe(2)
    expect(headings[2].depth).toBe(3)
  })

  it('parses unordered lists', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3'
    const ast = parser.parse(markdown) as Root
    const list = ast.children[0] as List

    expect(list.type).toBe('list')
    expect(list.ordered).toBe(false)
    expect(list.children).toHaveLength(3)
  })

  it('parses ordered lists', () => {
    const markdown = '1. First\n2. Second\n3. Third'
    const ast = parser.parse(markdown) as Root
    const list = ast.children[0] as List

    expect(list.type).toBe('list')
    expect(list.ordered).toBe(true)
    expect(list.children).toHaveLength(3)
  })

  it('parses task lists with checked state (GFM)', () => {
    const markdown = '- [ ] Unchecked\n- [x] Checked'
    const ast = parser.parse(markdown) as Root
    const list = ast.children[0] as List
    const items = list.children as ListItem[]

    expect(items[0].checked).toBe(false)
    expect(items[1].checked).toBe(true)
  })

  it('parses nested lists', () => {
    const markdown = '- Parent\n  - Child 1\n  - Child 2'
    const ast = parser.parse(markdown) as Root
    const list = ast.children[0] as List
    const parentItem = list.children[0] as ListItem

    // Nested list is a child of the parent list item
    const nestedList = parentItem.children.find((n) => n.type === 'list') as List
    expect(nestedList).toBeDefined()
    expect(nestedList.children).toHaveLength(2)
  })

  it('handles empty content', () => {
    const ast = parser.parse('') as Root
    expect(ast.type).toBe('root')
    expect(ast.children).toHaveLength(0)
  })
})
