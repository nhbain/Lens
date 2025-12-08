import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateStateFilename } from './state-manager'

// Mock the file-system module since it depends on Tauri APIs
vi.mock('./file-system', () => ({
  readStateFile: vi.fn(),
  writeStateFileAtomic: vi.fn(),
  removeStateFile: vi.fn(),
  listStateFiles: vi.fn(),
  stateFileExists: vi.fn(),
  backupStateFile: vi.fn(),
  restoreFromBackup: vi.fn(),
}))

// Import mocked functions for use in tests
import * as fs from './file-system'

// Import after mocking
import {
  saveFileState,
  loadFileState,
  deleteFileState,
  listTrackedFiles,
  hasTrackingState,
  getOrCreateFileState,
  updateItemStatus,
  updateContentHash,
} from './state-manager'
import type { FileTrackingState } from './types'

describe('generateStateFilename', () => {
  it('generates consistent filename for same path', () => {
    const path = '/Users/test/project/README.md'
    const name1 = generateStateFilename(path)
    const name2 = generateStateFilename(path)

    expect(name1).toBe(name2)
  })

  it('generates different filenames for different paths', () => {
    const name1 = generateStateFilename('/path/to/file1.md')
    const name2 = generateStateFilename('/path/to/file2.md')

    expect(name1).not.toBe(name2)
  })

  it('generates filename with correct prefix and extension', () => {
    const name = generateStateFilename('/any/path.md')

    expect(name.startsWith('state-')).toBe(true)
    expect(name.endsWith('.json')).toBe(true)
  })

  it('generates filesystem-safe filename', () => {
    const name = generateStateFilename('/path/with spaces/and special!@#chars.md')

    // Should only contain alphanumeric, dash, and dot
    expect(/^[a-z0-9\-.]+$/i.test(name)).toBe(true)
  })
})

describe('saveFileState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes valid state to file', async () => {
    const state: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.stateFileExists).mockResolvedValue(false)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    await saveFileState(state)

    expect(fs.writeStateFileAtomic).toHaveBeenCalledTimes(1)
    const [filename, content] = vi.mocked(fs.writeStateFileAtomic).mock.calls[0]
    expect(filename).toMatch(/^state-.*\.json$/)

    const writtenState = JSON.parse(content)
    expect(writtenState.sourcePath).toBe('/path/to/file.md')
    expect(writtenState.contentHash).toBe('abc123')
  })

  it('creates backup before overwriting existing file', async () => {
    const state: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.stateFileExists).mockResolvedValue(true)
    vi.mocked(fs.backupStateFile).mockResolvedValue(true)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    await saveFileState(state)

    expect(fs.backupStateFile).toHaveBeenCalledTimes(1)
  })

  it('throws error for invalid state', async () => {
    const invalidState = {
      sourcePath: '/path/to/file.md',
      // missing required fields
    } as FileTrackingState

    await expect(saveFileState(invalidState)).rejects.toThrow('Invalid FileTrackingState')
  })

  it('updates updatedAt timestamp when saving', async () => {
    const state: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.stateFileExists).mockResolvedValue(false)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    const before = new Date().toISOString()
    await saveFileState(state)
    const after = new Date().toISOString()

    const [, content] = vi.mocked(fs.writeStateFileAtomic).mock.calls[0]
    const writtenState = JSON.parse(content)

    expect(writtenState.updatedAt >= before).toBe(true)
    expect(writtenState.updatedAt <= after).toBe(true)
  })
})

describe('loadFileState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for non-existent file', async () => {
    vi.mocked(fs.readStateFile).mockResolvedValue(null)

    const result = await loadFileState('/path/to/file.md')

    expect(result).toBeNull()
  })

  it('returns parsed state for valid file', async () => {
    const state: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.readStateFile).mockResolvedValue(JSON.stringify(state))

    const result = await loadFileState('/path/to/file.md')

    expect(result).toEqual(state)
  })

  it('attempts recovery from backup for invalid JSON', async () => {
    const validState: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.readStateFile)
      .mockResolvedValueOnce('invalid json {{{')
      .mockResolvedValueOnce(JSON.stringify(validState))
    vi.mocked(fs.restoreFromBackup).mockResolvedValue(true)

    const result = await loadFileState('/path/to/file.md')

    expect(fs.restoreFromBackup).toHaveBeenCalled()
    expect(result).toEqual(validState)
  })

  it('throws error when file and backup are both corrupted', async () => {
    vi.mocked(fs.readStateFile).mockResolvedValue('invalid json {{{')
    vi.mocked(fs.restoreFromBackup).mockResolvedValue(false)

    await expect(loadFileState('/path/to/file.md')).rejects.toThrow('Failed to parse state file')
  })
})

describe('deleteFileState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('removes state file and backup', async () => {
    vi.mocked(fs.removeStateFile).mockResolvedValue(undefined)

    await deleteFileState('/path/to/file.md')

    expect(fs.removeStateFile).toHaveBeenCalledTimes(2)
    // First call removes main file
    expect(vi.mocked(fs.removeStateFile).mock.calls[0][0]).toMatch(/^state-.*\.json$/)
    // Second call removes backup
    expect(vi.mocked(fs.removeStateFile).mock.calls[1][0]).toMatch(/^state-.*\.json\.bak$/)
  })
})

describe('listTrackedFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when no state files exist', async () => {
    vi.mocked(fs.listStateFiles).mockResolvedValue([])

    const result = await listTrackedFiles()

    expect(result).toEqual([])
  })

  it('returns source paths from state files', async () => {
    const state1: FileTrackingState = {
      sourcePath: '/path/to/file1.md',
      contentHash: 'hash1',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    const state2: FileTrackingState = {
      sourcePath: '/path/to/file2.md',
      contentHash: 'hash2',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.listStateFiles).mockResolvedValue(['state-abc.json', 'state-def.json'])
    vi.mocked(fs.readStateFile)
      .mockResolvedValueOnce(JSON.stringify(state1))
      .mockResolvedValueOnce(JSON.stringify(state2))

    const result = await listTrackedFiles()

    expect(result).toContain('/path/to/file1.md')
    expect(result).toContain('/path/to/file2.md')
  })

  it('ignores backup and temp files', async () => {
    vi.mocked(fs.listStateFiles).mockResolvedValue([
      'state-abc.json',
      'state-abc.json.bak',
      'state-abc.json.tmp',
    ])
    vi.mocked(fs.readStateFile).mockResolvedValue(
      JSON.stringify({
        sourcePath: '/path/to/file.md',
        contentHash: 'hash',
        items: {},
        collapsedItems: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })
    )

    const result = await listTrackedFiles()

    // Should only process the main state file, not backup or temp
    expect(fs.readStateFile).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
  })

  it('skips invalid state files', async () => {
    vi.mocked(fs.listStateFiles).mockResolvedValue(['state-abc.json', 'state-def.json'])
    vi.mocked(fs.readStateFile)
      .mockResolvedValueOnce('invalid json')
      .mockResolvedValueOnce(
        JSON.stringify({
          sourcePath: '/path/to/valid.md',
          contentHash: 'hash',
          items: {},
          collapsedItems: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })
      )

    const result = await listTrackedFiles()

    expect(result).toEqual(['/path/to/valid.md'])
  })
})

describe('hasTrackingState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when state file exists', async () => {
    vi.mocked(fs.stateFileExists).mockResolvedValue(true)

    const result = await hasTrackingState('/path/to/file.md')

    expect(result).toBe(true)
  })

  it('returns false when state file does not exist', async () => {
    vi.mocked(fs.stateFileExists).mockResolvedValue(false)

    const result = await hasTrackingState('/path/to/file.md')

    expect(result).toBe(false)
  })
})

describe('getOrCreateFileState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns existing state if found', async () => {
    const existingState: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'existing-hash',
      items: { item1: { itemId: 'item1', status: 'complete', updatedAt: '2024-01-01T00:00:00.000Z' } },
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.readStateFile).mockResolvedValue(JSON.stringify(existingState))

    const result = await getOrCreateFileState('/path/to/file.md', 'new-hash')

    expect(result).toEqual(existingState)
    // Should not write new state
    expect(fs.writeStateFileAtomic).not.toHaveBeenCalled()
  })

  it('creates new state if not found', async () => {
    vi.mocked(fs.readStateFile).mockResolvedValue(null)
    vi.mocked(fs.stateFileExists).mockResolvedValue(false)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    const result = await getOrCreateFileState('/path/to/file.md', 'new-hash')

    expect(result.sourcePath).toBe('/path/to/file.md')
    expect(result.contentHash).toBe('new-hash')
    expect(result.items).toEqual({})
    expect(fs.writeStateFileAtomic).toHaveBeenCalled()
  })
})

describe('updateItemStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null if file state does not exist', async () => {
    vi.mocked(fs.readStateFile).mockResolvedValue(null)

    const result = await updateItemStatus('/path/to/file.md', 'item1', 'complete')

    expect(result).toBeNull()
  })

  it('updates existing item status', async () => {
    const existingState: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'hash',
      items: {
        item1: { itemId: 'item1', status: 'pending', updatedAt: '2024-01-01T00:00:00.000Z' },
      },
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.readStateFile).mockResolvedValue(JSON.stringify(existingState))
    vi.mocked(fs.stateFileExists).mockResolvedValue(true)
    vi.mocked(fs.backupStateFile).mockResolvedValue(true)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    const result = await updateItemStatus('/path/to/file.md', 'item1', 'complete')

    expect(result).not.toBeNull()
    expect(result!.items.item1.status).toBe('complete')
  })

  it('adds new item if not present', async () => {
    const existingState: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'hash',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.readStateFile).mockResolvedValue(JSON.stringify(existingState))
    vi.mocked(fs.stateFileExists).mockResolvedValue(true)
    vi.mocked(fs.backupStateFile).mockResolvedValue(true)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    const result = await updateItemStatus('/path/to/file.md', 'new-item', 'in_progress')

    expect(result).not.toBeNull()
    expect(result!.items['new-item']).toBeDefined()
    expect(result!.items['new-item'].status).toBe('in_progress')
  })
})

describe('updateContentHash', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null if file state does not exist', async () => {
    vi.mocked(fs.readStateFile).mockResolvedValue(null)

    const result = await updateContentHash('/path/to/file.md', 'new-hash')

    expect(result).toBeNull()
  })

  it('updates content hash', async () => {
    const existingState: FileTrackingState = {
      sourcePath: '/path/to/file.md',
      contentHash: 'old-hash',
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fs.readStateFile).mockResolvedValue(JSON.stringify(existingState))
    vi.mocked(fs.stateFileExists).mockResolvedValue(true)
    vi.mocked(fs.backupStateFile).mockResolvedValue(true)
    vi.mocked(fs.writeStateFileAtomic).mockResolvedValue(undefined)

    const result = await updateContentHash('/path/to/file.md', 'new-hash')

    expect(result).not.toBeNull()
    expect(result!.contentHash).toBe('new-hash')
  })
})
