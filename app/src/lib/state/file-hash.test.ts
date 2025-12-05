import { describe, it, expect } from 'vitest'
import {
  computeContentHash,
  computeNormalizedHash,
  hasContentChanged,
  hasMeaningfulChange,
  computeHashes,
} from './file-hash'

describe('computeContentHash', () => {
  it('returns consistent hash for same content', () => {
    const content = 'Hello, World!'
    const hash1 = computeContentHash(content)
    const hash2 = computeContentHash(content)

    expect(hash1).toBe(hash2)
  })

  it('returns different hash for different content', () => {
    const hash1 = computeContentHash('Hello')
    const hash2 = computeContentHash('World')

    expect(hash1).not.toBe(hash2)
  })

  it('returns hexadecimal string', () => {
    const hash = computeContentHash('test content')

    expect(/^[0-9a-f]+$/.test(hash)).toBe(true)
  })

  it('returns at least 8 character hash', () => {
    const hash = computeContentHash('test')

    expect(hash.length).toBeGreaterThanOrEqual(8)
  })

  it('handles empty string', () => {
    const hash = computeContentHash('')

    expect(hash).toBeDefined()
    expect(hash.length).toBeGreaterThan(0)
  })

  it('handles unicode content', () => {
    const hash1 = computeContentHash('Hello 世界')
    const hash2 = computeContentHash('Hello 世界')

    expect(hash1).toBe(hash2)
  })

  it('is sensitive to whitespace', () => {
    const hash1 = computeContentHash('Hello World')
    const hash2 = computeContentHash('Hello  World')

    expect(hash1).not.toBe(hash2)
  })

  it('is sensitive to line endings', () => {
    const hash1 = computeContentHash('Line1\nLine2')
    const hash2 = computeContentHash('Line1\r\nLine2')

    expect(hash1).not.toBe(hash2)
  })
})

describe('computeNormalizedHash', () => {
  it('returns consistent hash for same content', () => {
    const content = 'Hello, World!'
    const hash1 = computeNormalizedHash(content)
    const hash2 = computeNormalizedHash(content)

    expect(hash1).toBe(hash2)
  })

  it('normalizes multiple spaces', () => {
    const hash1 = computeNormalizedHash('Hello World')
    const hash2 = computeNormalizedHash('Hello    World')

    expect(hash1).toBe(hash2)
  })

  it('normalizes tabs to spaces', () => {
    const hash1 = computeNormalizedHash('Hello World')
    const hash2 = computeNormalizedHash('Hello\tWorld')

    expect(hash1).toBe(hash2)
  })

  it('normalizes line endings', () => {
    const hash1 = computeNormalizedHash('Line1\nLine2')
    const hash2 = computeNormalizedHash('Line1\r\nLine2')

    expect(hash1).toBe(hash2)
  })

  it('collapses multiple blank lines', () => {
    const hash1 = computeNormalizedHash('Line1\n\nLine2')
    const hash2 = computeNormalizedHash('Line1\n\n\n\nLine2')

    expect(hash1).toBe(hash2)
  })

  it('trims leading and trailing whitespace', () => {
    const hash1 = computeNormalizedHash('Hello World')
    const hash2 = computeNormalizedHash('  Hello World  ')

    expect(hash1).toBe(hash2)
  })

  it('still detects actual content changes', () => {
    const hash1 = computeNormalizedHash('Hello World')
    const hash2 = computeNormalizedHash('Hello Everyone')

    expect(hash1).not.toBe(hash2)
  })
})

describe('hasContentChanged', () => {
  it('returns false when content matches stored hash', () => {
    const content = 'Test content'
    const storedHash = computeContentHash(content)

    expect(hasContentChanged(content, storedHash)).toBe(false)
  })

  it('returns true when content differs from stored hash', () => {
    const originalContent = 'Original content'
    const storedHash = computeContentHash(originalContent)
    const newContent = 'Modified content'

    expect(hasContentChanged(newContent, storedHash)).toBe(true)
  })

  it('detects whitespace changes', () => {
    const content = 'Hello World'
    const storedHash = computeContentHash(content)
    const modifiedContent = 'Hello  World'

    expect(hasContentChanged(modifiedContent, storedHash)).toBe(true)
  })
})

describe('hasMeaningfulChange', () => {
  it('returns false when only whitespace differs', () => {
    const content = 'Hello World'
    const storedHash = computeNormalizedHash(content)
    const modifiedContent = 'Hello    World'

    expect(hasMeaningfulChange(modifiedContent, storedHash)).toBe(false)
  })

  it('returns true when actual content changes', () => {
    const content = 'Hello World'
    const storedHash = computeNormalizedHash(content)
    const modifiedContent = 'Hello Everyone'

    expect(hasMeaningfulChange(modifiedContent, storedHash)).toBe(true)
  })

  it('ignores line ending differences', () => {
    const content = 'Line1\nLine2'
    const storedHash = computeNormalizedHash(content)
    const modifiedContent = 'Line1\r\nLine2'

    expect(hasMeaningfulChange(modifiedContent, storedHash)).toBe(false)
  })

  it('ignores extra blank lines', () => {
    const content = 'Para1\n\nPara2'
    const storedHash = computeNormalizedHash(content)
    const modifiedContent = 'Para1\n\n\n\nPara2'

    expect(hasMeaningfulChange(modifiedContent, storedHash)).toBe(false)
  })
})

describe('computeHashes', () => {
  it('returns both hash types', () => {
    const content = 'Test content'
    const hashes = computeHashes(content)

    expect(hashes.contentHash).toBeDefined()
    expect(hashes.normalizedHash).toBeDefined()
    expect(typeof hashes.contentHash).toBe('string')
    expect(typeof hashes.normalizedHash).toBe('string')
  })

  it('contentHash matches computeContentHash output', () => {
    const content = 'Test content'
    const hashes = computeHashes(content)
    const directHash = computeContentHash(content)

    expect(hashes.contentHash).toBe(directHash)
  })

  it('normalizedHash matches computeNormalizedHash output', () => {
    const content = 'Test content'
    const hashes = computeHashes(content)
    const directHash = computeNormalizedHash(content)

    expect(hashes.normalizedHash).toBe(directHash)
  })

  it('different hashes for whitespace-sensitive content', () => {
    const content = 'Hello    World'
    const hashes = computeHashes(content)

    // Content hash sees the extra spaces
    const normalContent = 'Hello World'
    const normalHashes = computeHashes(normalContent)

    expect(hashes.contentHash).not.toBe(normalHashes.contentHash)
    expect(hashes.normalizedHash).toBe(normalHashes.normalizedHash)
  })
})

describe('Real-world scenarios', () => {
  it('handles markdown file content', () => {
    const markdown = `# Title

## Section 1

- [ ] Task 1
- [x] Task 2

Some paragraph text here.
`
    const hash = computeContentHash(markdown)

    expect(hash).toBeDefined()
    expect(hash.length).toBeGreaterThanOrEqual(8)
  })

  it('detects added checkbox', () => {
    const original = `# Tasks

- [ ] Task 1
- [x] Task 2
`
    const modified = `# Tasks

- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`
    const originalHash = computeContentHash(original)

    expect(hasContentChanged(modified, originalHash)).toBe(true)
  })

  it('detects checkbox state change', () => {
    const original = `- [ ] Task`
    const modified = `- [x] Task`
    const originalHash = computeContentHash(original)

    expect(hasContentChanged(modified, originalHash)).toBe(true)
  })

  it('detects header level change', () => {
    const original = `# Header`
    const modified = `## Header`
    const originalHash = computeContentHash(original)

    expect(hasContentChanged(modified, originalHash)).toBe(true)
  })

  it('handles large files efficiently', () => {
    // Create a large content string (100KB)
    const largeContent = 'x'.repeat(100 * 1024)

    const startTime = performance.now()
    const hash = computeContentHash(largeContent)
    const duration = performance.now() - startTime

    expect(hash).toBeDefined()
    // Should complete in under 100ms even for large files
    expect(duration).toBeLessThan(100)
  })
})
