import { describe, it, expect } from 'vitest'
import { parseMarkdown } from './markdown-parser'
import { extractItems, buildTree, flattenTree, parseDocument } from './item-extractor'

describe('extractItems', () => {
  describe('headers', () => {
    it('extracts H1 headers', () => {
      const ast = parseMarkdown('# Main Title')
      const items = extractItems(ast)

      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('header')
      expect(items[0].content).toBe('Main Title')
      expect(items[0].depth).toBe(1)
    })

    it('extracts headers H1-H6 with correct depth', () => {
      const markdown = `# H1
## H2
### H3
#### H4
##### H5
###### H6`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items).toHaveLength(6)
      items.forEach((item, index) => {
        expect(item.type).toBe('header')
        expect(item.depth).toBe(index + 1)
      })
    })

    it('preserves header text content', () => {
      const ast = parseMarkdown('## Section with **bold** and *italic*')
      const items = extractItems(ast)

      expect(items[0].content).toBe('Section with bold and italic')
    })

    it('includes position info for headers', () => {
      const ast = parseMarkdown('# Header\n\n## Another')
      const items = extractItems(ast)

      expect(items[0].position.line).toBe(1)
      expect(items[1].position.line).toBe(3)
    })

    it('includes end position info for headers', () => {
      const ast = parseMarkdown('# Header\n\n## Another Header')
      const items = extractItems(ast)

      expect(items[0].position.endLine).toBe(1)
      expect(items[0].position.endColumn).toBeDefined()
      expect(items[1].position.endLine).toBe(3)
      expect(items[1].position.endColumn).toBeDefined()
    })
  })

  describe('list items', () => {
    it('extracts unordered list items', () => {
      const ast = parseMarkdown('- Item 1\n- Item 2\n- Item 3')
      const items = extractItems(ast)

      expect(items).toHaveLength(3)
      items.forEach((item) => {
        expect(item.type).toBe('listItem')
        expect(item.ordered).toBe(false)
      })
    })

    it('extracts ordered list items', () => {
      const ast = parseMarkdown('1. First\n2. Second\n3. Third')
      const items = extractItems(ast)

      expect(items).toHaveLength(3)
      items.forEach((item) => {
        expect(item.type).toBe('listItem')
        expect(item.ordered).toBe(true)
      })
    })

    it('preserves list item content', () => {
      const ast = parseMarkdown('- First item\n- Second item')
      const items = extractItems(ast)

      expect(items[0].content).toBe('First item')
      expect(items[1].content).toBe('Second item')
    })

    it('handles nested lists', () => {
      const markdown = `- Parent
  - Child 1
  - Child 2`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items).toHaveLength(1)
      expect(items[0].content).toBe('Parent')
      expect(items[0].children).toHaveLength(2)
      expect(items[0].children[0].content).toBe('Child 1')
      expect(items[0].children[0].depth).toBe(1)
    })

    it('handles deeply nested lists', () => {
      const markdown = `- Level 0
  - Level 1
    - Level 2
      - Level 3`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items[0].depth).toBe(0)
      expect(items[0].children[0].depth).toBe(1)
      expect(items[0].children[0].children[0].depth).toBe(2)
      expect(items[0].children[0].children[0].children[0].depth).toBe(3)
    })

    it('includes end position info for list items', () => {
      const ast = parseMarkdown('- Item 1\n- Item 2\n- Item 3')
      const items = extractItems(ast)

      items.forEach((item) => {
        expect(item.position.endLine).toBeDefined()
        expect(item.position.endColumn).toBeDefined()
        expect(item.position.endLine).toBeGreaterThanOrEqual(item.position.line)
      })
    })

    it('calculates end position for nested list items correctly', () => {
      const markdown = `- Parent
  - Child 1
  - Child 2`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      // Parent should have end position at the last child's end
      expect(items[0].position.endLine).toBeGreaterThan(items[0].position.line)
      expect(items[0].children).toHaveLength(2)

      // Parent's end should be at or after the last child's end
      const lastChild = items[0].children[1]
      expect(items[0].position.endLine).toBeGreaterThanOrEqual(lastChild.position.line)
    })
  })

  describe('checkboxes', () => {
    it('extracts unchecked checkboxes', () => {
      const ast = parseMarkdown('- [ ] Todo item')
      const items = extractItems(ast)

      expect(items).toHaveLength(1)
      expect(items[0].type).toBe('checkbox')
      expect(items[0].checked).toBe(false)
    })

    it('extracts checked checkboxes', () => {
      const ast = parseMarkdown('- [x] Done item')
      const items = extractItems(ast)

      expect(items[0].type).toBe('checkbox')
      expect(items[0].checked).toBe(true)
    })

    it('handles mixed checkboxes and regular list items', () => {
      const markdown = `- Regular item
- [ ] Todo
- [x] Done
- Another regular`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items[0].type).toBe('listItem')
      expect(items[1].type).toBe('checkbox')
      expect(items[1].checked).toBe(false)
      expect(items[2].type).toBe('checkbox')
      expect(items[2].checked).toBe(true)
      expect(items[3].type).toBe('listItem')
    })

    it('handles nested checkboxes', () => {
      const markdown = `- [ ] Parent task
  - [ ] Subtask 1
  - [x] Subtask 2`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items[0].type).toBe('checkbox')
      expect(items[0].children).toHaveLength(2)
      expect(items[0].children[0].type).toBe('checkbox')
      expect(items[0].children[0].checked).toBe(false)
      expect(items[0].children[1].checked).toBe(true)
    })
  })

  describe('stable IDs', () => {
    it('generates consistent IDs for same content and position', () => {
      const ast1 = parseMarkdown('# Header')
      const ast2 = parseMarkdown('# Header')
      const items1 = extractItems(ast1)
      const items2 = extractItems(ast2)

      expect(items1[0].id).toBe(items2[0].id)
    })

    it('generates different IDs for different content', () => {
      const ast1 = parseMarkdown('# Header A')
      const ast2 = parseMarkdown('# Header B')
      const items1 = extractItems(ast1)
      const items2 = extractItems(ast2)

      expect(items1[0].id).not.toBe(items2[0].id)
    })

    it('generates different IDs for same content at different positions', () => {
      const markdown = `# Same Title

## Other

# Same Title`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      // Should have 3 headers, first and third have same content
      const firstId = items[0].id
      const thirdId = items[2].id

      expect(firstId).not.toBe(thirdId)
    })
  })
})

describe('buildTree', () => {
  it('returns empty array for empty input', () => {
    const tree = buildTree([])
    expect(tree).toHaveLength(0)
  })

  it('groups items under headers', () => {
    const markdown = `# Header

- Item 1
- Item 2`
    const ast = parseMarkdown(markdown)
    const items = extractItems(ast)
    const tree = buildTree(items)

    expect(tree).toHaveLength(1)
    expect(tree[0].type).toBe('header')
    expect(tree[0].children).toHaveLength(2)
  })

  it('handles multiple header levels', () => {
    const markdown = `# Main

## Sub 1

- Item under sub 1

## Sub 2

- Item under sub 2`
    const ast = parseMarkdown(markdown)
    const items = extractItems(ast)
    const tree = buildTree(items)

    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(2) // Two H2 sections
    expect(tree[0].children[0].type).toBe('header')
    expect(tree[0].children[0].children).toHaveLength(1) // Item under sub 1
    expect(tree[0].children[1].children).toHaveLength(1) // Item under sub 2
  })

  it('handles items before any header', () => {
    const markdown = `- Item before header

# Header`
    const ast = parseMarkdown(markdown)
    const items = extractItems(ast)
    const tree = buildTree(items)

    expect(tree).toHaveLength(2)
    expect(tree[0].type).toBe('listItem')
    expect(tree[1].type).toBe('header')
  })

  it('resets to higher level header', () => {
    const markdown = `## Sub Header

- Item

# Main Header

- Another item`
    const ast = parseMarkdown(markdown)
    const items = extractItems(ast)
    const tree = buildTree(items)

    expect(tree).toHaveLength(2)
    expect(tree[0].type).toBe('header')
    expect(tree[0].depth).toBe(2)
    expect(tree[1].type).toBe('header')
    expect(tree[1].depth).toBe(1)
  })

  it('calculates end position for headers with children', () => {
    const markdown = `# Header

- Item 1
- Item 2

## Sub Header

- Item 3`
    const ast = parseMarkdown(markdown)
    const items = extractItems(ast)
    const tree = buildTree(items)

    // Main header should have end position at the end of last child
    expect(tree[0].type).toBe('header')
    expect(tree[0].children.length).toBeGreaterThan(0)
    expect(tree[0].position.endLine).toBeDefined()

    // The header's end line should be at or after its start line
    expect(tree[0].position.endLine).toBeGreaterThanOrEqual(tree[0].position.line)

    // If it has children, end should be at or after the last child
    if (tree[0].children.length > 0) {
      const lastChild = tree[0].children[tree[0].children.length - 1]
      expect(tree[0].position.endLine).toBeGreaterThanOrEqual(lastChild.position.line)
    }
  })
})

describe('flattenTree', () => {
  it('flattens nested structure to array', () => {
    const markdown = `# Header

- Item 1
- Item 2`
    const ast = parseMarkdown(markdown)
    const items = extractItems(ast)
    const tree = buildTree(items)
    const flat = flattenTree(tree)

    expect(flat).toHaveLength(3)
    expect(flat[0].type).toBe('header')
    expect(flat[1].type).toBe('listItem')
    expect(flat[2].type).toBe('listItem')
  })
})

describe('parseDocument', () => {
  it('returns complete ParsedDocument structure', () => {
    const markdown = `# Header

- Item 1
- Item 2`
    const ast = parseMarkdown(markdown)
    const doc = parseDocument(ast, '/path/to/file.md')

    expect(doc.sourcePath).toBe('/path/to/file.md')
    expect(doc.items).toHaveLength(3)
    expect(doc.tree).toHaveLength(1)
    expect(doc.itemCount).toBe(3)
    expect(doc.parsedAt).toBeInstanceOf(Date)
  })

  it('works without sourcePath', () => {
    const ast = parseMarkdown('# Test')
    const doc = parseDocument(ast)

    expect(doc.sourcePath).toBeUndefined()
    expect(doc.items).toHaveLength(1)
  })
})

describe('Edge Cases', () => {
  describe('empty and minimal content', () => {
    it('handles empty files', () => {
      const ast = parseMarkdown('')
      const items = extractItems(ast)

      expect(items).toHaveLength(0)
    })

    it('handles whitespace-only files', () => {
      const ast = parseMarkdown('   \n\n\t\n   ')
      const items = extractItems(ast)

      expect(items).toHaveLength(0)
    })

    it('handles files with only paragraphs (no trackable items)', () => {
      const markdown = `This is just a paragraph.

Another paragraph with some text.

And one more paragraph.`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items).toHaveLength(0)
    })

    it('handles files with only code blocks (no trackable items)', () => {
      const markdown = `\`\`\`javascript
const x = 1;
console.log(x);
\`\`\`

\`\`\`python
print("hello")
\`\`\``
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items).toHaveLength(0)
    })

    it('handles files with only blockquotes (no trackable items)', () => {
      const markdown = `> This is a quote
> spanning multiple lines

> Another quote`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items).toHaveLength(0)
    })
  })

  describe('deeply nested structures', () => {
    it('handles 5+ levels of nested lists', () => {
      const markdown = `- Level 0
  - Level 1
    - Level 2
      - Level 3
        - Level 4
          - Level 5`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      // Navigate through the nested structure
      let current = items[0]
      for (let depth = 0; depth <= 5; depth++) {
        expect(current.depth).toBe(depth)
        if (depth < 5) {
          expect(current.children).toHaveLength(1)
          current = current.children[0]
        }
      }
    })

    it('handles 6 levels of headers', () => {
      const markdown = `# H1
## H2
### H3
#### H4
##### H5
###### H6`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)
      const tree = buildTree(items)

      // All 6 headers should be extracted
      expect(items).toHaveLength(6)

      // Tree should have H1 at root containing rest
      expect(tree).toHaveLength(1)
      expect(tree[0].depth).toBe(1)
    })
  })

  describe('mixed content', () => {
    it('handles headers interspersed with lists', () => {
      const markdown = `# Section 1

- Item 1a
- Item 1b

## Subsection

- Item 2a

# Section 2

- Item 3a`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)
      const tree = buildTree(items)

      // Should have: 2 H1, 1 H2, 4 list items = 7 total
      expect(items).toHaveLength(7)

      // Tree should have 2 top-level H1 sections
      expect(tree).toHaveLength(2)
      expect(tree[0].type).toBe('header')
      expect(tree[1].type).toBe('header')
    })

    it('handles checkboxes mixed with regular items and headers', () => {
      const markdown = `# Todo List

- [ ] Task 1
- Regular item
- [x] Task 2 (done)

## Subtasks

- [ ] Subtask A
- [ ] Subtask B`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      const checkboxes = items.filter((i) => i.type === 'checkbox')
      const listItems = items.filter((i) => i.type === 'listItem')
      const headers = items.filter((i) => i.type === 'header')

      expect(checkboxes).toHaveLength(4)
      expect(listItems).toHaveLength(1)
      expect(headers).toHaveLength(2)
    })

    it('handles paragraphs between trackable items', () => {
      const markdown = `# Header

Some explanatory text here.

- Item 1
- Item 2

More text in between.

## Another Header

Final paragraph.

- Last item`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      // Should only extract headers and list items, not paragraphs
      expect(items).toHaveLength(5) // 2 headers + 3 list items
    })

    it('handles code blocks between trackable items', () => {
      const markdown = `# Setup

\`\`\`bash
npm install
\`\`\`

- Step 1
- Step 2`
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      // Code block should be skipped
      expect(items).toHaveLength(3) // 1 header + 2 list items
    })
  })

  describe('special characters and formatting', () => {
    it('handles headers with special characters', () => {
      const ast = parseMarkdown('# Header with `code` and [link](url)')
      const items = extractItems(ast)

      expect(items[0].content).toContain('code')
      expect(items[0].content).toContain('link')
    })

    it('handles list items with inline formatting', () => {
      const ast = parseMarkdown('- **Bold** and *italic* and `code`')
      const items = extractItems(ast)

      expect(items[0].content).toBe('Bold and italic and code')
    })

    it('handles empty list items', () => {
      const markdown = `-
- Item with content
- `
      const ast = parseMarkdown(markdown)
      const items = extractItems(ast)

      expect(items).toHaveLength(3)
      expect(items[0].content).toBe('')
      expect(items[1].content).toBe('Item with content')
      expect(items[2].content).toBe('')
    })

    it('handles headers with only whitespace', () => {
      const ast = parseMarkdown('#    ')
      const items = extractItems(ast)

      expect(items).toHaveLength(1)
      expect(items[0].content).toBe('')
    })
  })

  describe('parseDocument edge cases', () => {
    it('handles empty document', () => {
      const ast = parseMarkdown('')
      const doc = parseDocument(ast)

      expect(doc.items).toHaveLength(0)
      expect(doc.tree).toHaveLength(0)
      expect(doc.itemCount).toBe(0)
    })

    it('handles document with no trackable items', () => {
      const markdown = `Just some text.

\`\`\`code\`\`\`

> quote`
      const ast = parseMarkdown(markdown)
      const doc = parseDocument(ast)

      expect(doc.items).toHaveLength(0)
      expect(doc.tree).toHaveLength(0)
      expect(doc.itemCount).toBe(0)
    })
  })
})
