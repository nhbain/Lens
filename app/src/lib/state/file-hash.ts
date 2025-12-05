/**
 * Content hashing utilities for file change detection.
 * Used to determine when source markdown files have been modified.
 */

/**
 * Computes a simple hash of file content.
 * Uses a variation of djb2 hash for speed and reasonable distribution.
 *
 * @param content - The file content to hash
 * @returns A hexadecimal hash string
 */
export function computeContentHash(content: string): string {
  let hash = 5381

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) + hash) ^ char // hash * 33 ^ char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to hex and ensure it's always positive
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Computes a normalized hash that ignores whitespace differences.
 * Useful for detecting meaningful content changes vs formatting changes.
 *
 * @param content - The file content to hash
 * @returns A hexadecimal hash string
 */
export function computeNormalizedHash(content: string): string {
  // Normalize whitespace: collapse multiple spaces/tabs, normalize line endings
  const normalized = content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/[ \t]+/g, ' ') // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple blank lines
    .trim()

  return computeContentHash(normalized)
}

/**
 * Checks if the source file content has changed since tracking was created.
 *
 * @param currentContent - The current file content
 * @param storedHash - The hash stored in the tracking state
 * @returns True if the content has changed
 */
export function hasContentChanged(
  currentContent: string,
  storedHash: string
): boolean {
  const currentHash = computeContentHash(currentContent)
  return currentHash !== storedHash
}

/**
 * Checks if meaningful content has changed (ignoring whitespace).
 *
 * @param currentContent - The current file content
 * @param storedHash - The normalized hash stored in the tracking state
 * @returns True if meaningful content has changed
 */
export function hasMeaningfulChange(
  currentContent: string,
  storedHash: string
): boolean {
  const currentHash = computeNormalizedHash(currentContent)
  return currentHash !== storedHash
}

/**
 * Computes both regular and normalized hashes for a piece of content.
 *
 * @param content - The file content to hash
 * @returns Object with both hash values
 */
export function computeHashes(content: string): {
  contentHash: string
  normalizedHash: string
} {
  return {
    contentHash: computeContentHash(content),
    normalizedHash: computeNormalizedHash(content),
  }
}
