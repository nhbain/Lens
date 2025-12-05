# Task List for STORY-LENS-002: Markdown Parser Integration

> Generated from: story-list-feature-lens.md
> Story: As a developer, I want a robust markdown parsing system so that I can extract trackable items from any markdown file.
> Acceptance Criteria: Parser correctly identifies all headers, list items, and checkboxes; nested structures maintain hierarchy; parser handles edge cases gracefully (empty files, malformed markdown).

## Relevant Files

- `app/src/lib/parser/poc.test.ts` - Proof-of-concept tests verifying remark library capabilities
- `app/src/lib/parser/types.ts` - TypeScript interfaces for TrackableItem and parsed document structure
- `app/src/lib/parser/types.test.ts` - Type validation tests
- `app/src/lib/parser/markdown-parser.ts` - Core markdown parsing functions using remark
- `app/src/lib/parser/markdown-parser.test.ts` - Unit tests for parser
- `app/src/lib/parser/item-extractor.ts` - AST traversal logic to extract trackable items
- `app/src/lib/parser/item-extractor.test.ts` - Unit tests for item extraction
- `app/src/lib/parser/index.ts` - Public API exports

### Notes

- Unit tests should be placed alongside the code files they test
- Use `npm run test` to run all tests
- Prefer well-maintained libraries over custom implementations
- Use `remark` ecosystem for markdown parsing (well-maintained, good TypeScript support, large community)

## Tasks

- [x] 1.0 Research & Select Markdown Parser Library
  - [x] 1.1 Evaluate `remark` (unified ecosystem) vs `markdown-it` for AST access and TypeScript support
  - [x] 1.2 Verify chosen library can expose position info (line numbers) for each AST node
  - [x] 1.3 Install `remark`, `remark-parse`, `remark-gfm` (for task lists), and `unist-util-visit`
  - [x] 1.4 Create minimal proof-of-concept parsing a sample markdown string

- [x] 2.0 Define Data Model for Trackable Items
  - [x] 2.1 Create `TrackableItemType` enum: `header`, `listItem`, `checkbox`
  - [x] 2.2 Create `TrackableItem` interface with: id, type, content, depth/level, lineNumber, children array
  - [x] 2.3 Create `ParsedDocument` interface with: sourceFile, items (flat + tree), parseTimestamp
  - [x] 2.4 Add JSDoc comments explaining each field's purpose
  - [x] 2.5 Write type guard functions for runtime validation

- [x] 3.0 Implement Core Markdown Parsing
  - [x] 3.1 Create `parseMarkdown(content: string)` function returning remark AST
  - [x] 3.2 Configure remark with GFM plugin for checkbox/task list support
  - [x] 3.3 Write unit tests: valid markdown returns AST, empty string returns empty AST
  - [x] 3.4 Verify AST includes position data for all nodes

- [x] 4.0 Build AST Traversal & Item Extraction
  - [x] 4.1 Create `extractItems(ast)` function that walks the AST tree
  - [x] 4.2 Implement header extraction (H1-H6) with level preserved
  - [x] 4.3 Implement list item extraction (ordered and unordered)
  - [x] 4.4 Implement checkbox extraction with checked state detection
  - [x] 4.5 Build parent/child relationships based on nesting (list items under headers, nested lists)
  - [x] 4.6 Generate stable IDs for each item (based on position + content hash)
  - [x] 4.7 Write unit tests for each item type with nested structures

- [x] 5.0 Handle Edge Cases & Validation
  - [x] 5.1 Handle empty files (return empty items array)
  - [x] 5.2 Handle files with no trackable items (only paragraphs/code blocks)
  - [x] 5.3 Handle deeply nested lists (5+ levels)
  - [x] 5.4 Handle mixed content (headers + lists + checkboxes interleaved)
  - [x] 5.5 Write tests for each edge case scenario

- [x] 6.0 Integration & Documentation
  - [x] 6.1 Create `index.ts` exporting public API: `parseDocument`, types, utilities
  - [x] 6.2 Add comprehensive JSDoc comments to all exported functions
  - [x] 6.3 Run full test suite and ensure all tests pass
  - [x] 6.4 Run linter and fix any issues
