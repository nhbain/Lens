import { describe, it, expect } from 'vitest'
import { extractMarkdownSlice } from './markdown-slice'
import type { TrackableItem } from '../parser/types'

describe('extractMarkdownSlice', () => {
  describe('single-line extraction', () => {
    it('extracts a single-line header', () => {
      const markdown = '# Header Title'
      const item: TrackableItem = {
        id: 'test1',
        type: 'header',
        content: 'Header Title',
        depth: 1,
        position: { line: 1, column: 1, endLine: 1, endColumn: 15 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# Header Title')
    })

    it('extracts a list item on a single line', () => {
      const markdown = '- List item text'
      const item: TrackableItem = {
        id: 'test2',
        type: 'listItem',
        content: 'List item text',
        depth: 0,
        position: { line: 1, column: 1, endLine: 1, endColumn: 17 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('- List item text')
    })

    it('extracts a checkbox item', () => {
      const markdown = '- [ ] Todo item'
      const item: TrackableItem = {
        id: 'test3',
        type: 'checkbox',
        content: 'Todo item',
        depth: 0,
        position: { line: 1, column: 1, endLine: 1, endColumn: 16 },
        checked: false,
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('- [ ] Todo item')
    })

    it('extracts from middle of a line', () => {
      const markdown = 'Text before # Header after'
      const item: TrackableItem = {
        id: 'test4',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 1, column: 13, endLine: 1, endColumn: 21 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# Header')
    })
  })

  describe('multi-line extraction', () => {
    it('extracts a header on one line', () => {
      const markdown = `# Header

Some text below`
      const item: TrackableItem = {
        id: 'test5',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 1, column: 1, endLine: 1, endColumn: 9 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# Header')
    })

    it('extracts nested list with multiple lines', () => {
      const markdown = `- Parent item
  - Child item 1
  - Child item 2`
      const item: TrackableItem = {
        id: 'test7',
        type: 'listItem',
        content: 'Parent item',
        depth: 0,
        position: { line: 1, column: 1, endLine: 3, endColumn: 17 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`- Parent item
  - Child item 1
  - Child item 2`)
    })

    it('extracts header with following list items', () => {
      const markdown = `# Main Header

- Item 1
- Item 2

## Sub Header`
      const item: TrackableItem = {
        id: 'test8',
        type: 'header',
        content: 'Main Header',
        depth: 1,
        position: { line: 1, column: 1, endLine: 4, endColumn: 9 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`# Main Header

- Item 1
- Item 2`)
    })

    it('handles extraction spanning many lines', () => {
      const markdown = `# Section

Paragraph text here.

- Item A
- Item B
- Item C

More content.`
      const item: TrackableItem = {
        id: 'test9',
        type: 'header',
        content: 'Section',
        depth: 1,
        position: { line: 1, column: 1, endLine: 7, endColumn: 9 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`# Section

Paragraph text here.

- Item A
- Item B
- Item C`)
    })
  })

  describe('deeply nested structures', () => {
    it('extracts deeply nested list items', () => {
      const markdown = `- Level 0
  - Level 1
    - Level 2
      - Level 3`
      const lines = markdown.split('\n')
      const lastLineLength = lines[3].length
      const item: TrackableItem = {
        id: 'test10',
        type: 'listItem',
        content: 'Level 0',
        depth: 0,
        position: { line: 1, column: 1, endLine: 4, endColumn: lastLineLength + 1 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`- Level 0
  - Level 1
    - Level 2
      - Level 3`)
    })

    it('extracts nested checkboxes', () => {
      const markdown = `- [ ] Parent task
  - [ ] Subtask 1
  - [x] Subtask 2`
      const item: TrackableItem = {
        id: 'test11',
        type: 'checkbox',
        content: 'Parent task',
        depth: 0,
        position: { line: 1, column: 1, endLine: 3, endColumn: 18 },
        checked: false,
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`- [ ] Parent task
  - [ ] Subtask 1
  - [x] Subtask 2`)
    })
  })

  describe('special characters and formatting', () => {
    it('extracts headers with inline formatting', () => {
      const markdown = '# Header with **bold** and *italic*'
      const item: TrackableItem = {
        id: 'test13',
        type: 'header',
        content: 'Header with bold and italic',
        depth: 1,
        position: { line: 1, column: 1, endLine: 1, endColumn: markdown.length + 1 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# Header with **bold** and *italic*')
    })

    it('extracts list items with code inline', () => {
      const markdown = '- Item with `code` inline'
      const item: TrackableItem = {
        id: 'test14',
        type: 'listItem',
        content: 'Item with code inline',
        depth: 0,
        position: { line: 1, column: 1, endLine: 1, endColumn: 26 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('- Item with `code` inline')
    })

    it('preserves indentation for nested items', () => {
      const markdown = `- Parent
    - Child with extra spaces
        - Deeply nested`
      const lines = markdown.split('\n')
      const lastLineLength = lines[2].length
      const item: TrackableItem = {
        id: 'test16',
        type: 'listItem',
        content: 'Parent',
        depth: 0,
        position: { line: 1, column: 1, endLine: 3, endColumn: lastLineLength + 1 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`- Parent
    - Child with extra spaces
        - Deeply nested`)
    })
  })

  describe('error handling', () => {
    it('throws error if item has no end position', () => {
      const markdown = '# Header'
      const item: TrackableItem = {
        id: 'test17',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 1, column: 1 },
        children: [],
      }

      expect(() => extractMarkdownSlice(markdown, item)).toThrow(
        'Item must have end position information'
      )
    })

    it('throws error if start line is out of bounds', () => {
      const markdown = '# Header'
      const item: TrackableItem = {
        id: 'test18',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 10, column: 1, endLine: 10, endColumn: 9 },
        children: [],
      }

      expect(() => extractMarkdownSlice(markdown, item)).toThrow(
        'Start line 10 is out of bounds'
      )
    })

    it('throws error if end line is out of bounds', () => {
      const markdown = '# Header'
      const item: TrackableItem = {
        id: 'test19',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 1, column: 1, endLine: 10, endColumn: 9 },
        children: [],
      }

      expect(() => extractMarkdownSlice(markdown, item)).toThrow(
        'End line 10 is out of bounds'
      )
    })

    it('throws error if end line is before start line', () => {
      const markdown = `# Header 1

# Header 2`
      const item: TrackableItem = {
        id: 'test20',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 3, column: 1, endLine: 1, endColumn: 11 },
        children: [],
      }

      expect(() => extractMarkdownSlice(markdown, item)).toThrow(
        'End line 1 cannot be before start line 3'
      )
    })

    it('handles empty lines correctly', () => {
      const markdown = `

# Header


`
      const item: TrackableItem = {
        id: 'test21',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 3, column: 1, endLine: 3, endColumn: 9 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# Header')
    })
  })

  describe('sequential edit regression tests', () => {
    /**
     * These tests document the bug scenario where editing one section
     * and adding/removing lines causes subsequent edits to use stale positions.
     *
     * The extractMarkdownSlice function itself is stateless and correct -
     * it extracts the right content when given correct positions.
     * The real bug is at the application level where stale positions are used.
     */

    it('extracts correct slice after previous edit added lines', () => {
      // SCENARIO:
      // Original document has Section A (lines 1-3) and Section B (lines 5-7)
      // User edits Section A and adds 2 lines (now lines 1-5)
      // Document is now different, Section B is now at lines 7-9
      // If we extract Section B using OLD positions (5-7), we get wrong content

      // Original document (for context):
      // # Section A
      // Content A1
      //
      // # Section B
      // Content B1
      // Content B2

      // After editing Section A and adding 2 lines:
      const modifiedDocument = `# Section A
Content A1
Added Line 1
Added Line 2

# Section B
Content B1
Content B2`

      // Section B's NEW correct position (after the edit)
      const sectionBItem: TrackableItem = {
        id: 'section-b',
        type: 'header',
        content: 'Section B',
        depth: 1,
        position: { line: 6, column: 1, endLine: 8, endColumn: 11 },
        children: [],
      }

      // With correct (fresh) positions, extraction works correctly
      const result = extractMarkdownSlice(modifiedDocument, sectionBItem)
      expect(result).toBe(`# Section B
Content B1
Content B2`)
    })

    it('extracts correct slice after previous edit removed lines', () => {
      // SCENARIO:
      // Original document has Section A (lines 1-5) and Section B (lines 7-9)
      // User edits Section A and removes 2 lines (now lines 1-3)
      // Document is now different, Section B is now at lines 5-7

      const modifiedDocument = `# Section A
Content A1

# Section B
Content B1
Content B2`

      // Section B's NEW correct position (after lines were removed)
      const sectionBItem: TrackableItem = {
        id: 'section-b',
        type: 'header',
        content: 'Section B',
        depth: 1,
        position: { line: 4, column: 1, endLine: 6, endColumn: 11 },
        children: [],
      }

      const result = extractMarkdownSlice(modifiedDocument, sectionBItem)
      expect(result).toBe(`# Section B
Content B1
Content B2`)
    })

    it('handles sequential edits to different sections without corruption', () => {
      // Full workflow test:
      // 1. Start with document
      // 2. Edit Section A (add lines)
      // 3. Edit Section B (should use FRESH positions)
      // Both sections should have correct content

      // After Section A was edited and lines were added:
      const documentAfterFirstEdit = `# Section A
Content A1
New content line 1
New content line 2

# Section B
Content B1

# Section C
Content C1`

      // Section B with CORRECT positions for the modified document
      const sectionB: TrackableItem = {
        id: 'section-b',
        type: 'header',
        content: 'Section B',
        depth: 1,
        position: { line: 6, column: 1, endLine: 7, endColumn: 11 },
        children: [],
      }

      // Section C with CORRECT positions for the modified document
      const sectionC: TrackableItem = {
        id: 'section-c',
        type: 'header',
        content: 'Section C',
        depth: 1,
        position: { line: 9, column: 1, endLine: 10, endColumn: 11 },
        children: [],
      }

      // Both extractions should work correctly with fresh positions
      expect(extractMarkdownSlice(documentAfterFirstEdit, sectionB)).toBe(`# Section B
Content B1`)
      expect(extractMarkdownSlice(documentAfterFirstEdit, sectionC)).toBe(`# Section C
Content C1`)
    })

    it('demonstrates stale position issue - extraction with wrong positions', () => {
      // This test documents what happens when STALE positions are used
      // (the bug scenario we're fixing)

      // Document AFTER Section A was edited and 2 lines were added
      const modifiedDocument = `# Section A
Content A1
Added Line 1
Added Line 2

# Section B
Content B1
Content B2`

      // Section B's OLD (stale) position from BEFORE the edit
      // Originally Section B was at lines 4-6, but now it's at lines 6-8
      const staleItem: TrackableItem = {
        id: 'section-b',
        type: 'header',
        content: 'Section B',
        depth: 1,
        position: { line: 4, column: 1, endLine: 6, endColumn: 12 }, // STALE! (endColumn 12 = "# Section B" which is 11 chars)
        children: [],
      }

      // With stale positions, we extract the WRONG content
      const result = extractMarkdownSlice(modifiedDocument, staleItem)

      // This extracts lines 4-6 of the modified document, which is:
      // "Added Line 2\n\n# Section B" - NOT the expected Section B content!
      expect(result).not.toBe(`# Section B
Content B1
Content B2`)

      // It actually extracts this wrong content:
      expect(result).toBe(`Added Line 2

# Section B`)
    })
  })

  describe('edge cases', () => {
    it('extracts from first line of multi-line document', () => {
      const markdown = `# First Line
Second line
Third line`
      const item: TrackableItem = {
        id: 'test22',
        type: 'header',
        content: 'First Line',
        depth: 1,
        position: { line: 1, column: 1, endLine: 1, endColumn: 13 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# First Line')
    })

    it('extracts from last line of document', () => {
      const markdown = `First line
Second line
# Last Line`
      const item: TrackableItem = {
        id: 'test23',
        type: 'header',
        content: 'Last Line',
        depth: 1,
        position: { line: 3, column: 1, endLine: 3, endColumn: 12 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('# Last Line')
    })

    it('extracts entire document as one item', () => {
      const markdown = `# Header

- Item 1
- Item 2`
      const item: TrackableItem = {
        id: 'test24',
        type: 'header',
        content: 'Header',
        depth: 1,
        position: { line: 1, column: 1, endLine: 4, endColumn: 9 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe(`# Header

- Item 1
- Item 2`)
    })

    it('handles items at exact line boundaries', () => {
      const markdown = 'Line 1\nLine 2\nLine 3'
      const item: TrackableItem = {
        id: 'test25',
        type: 'listItem',
        content: 'Line 2',
        depth: 0,
        position: { line: 2, column: 1, endLine: 2, endColumn: 7 },
        children: [],
      }

      const result = extractMarkdownSlice(markdown, item)
      expect(result).toBe('Line 2')
    })
  })
})
