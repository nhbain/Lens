/**
 * Tests for TrackedFilesList component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TrackedFilesList, Message } from './TrackedFilesList'
import type { TrackedFile } from '../lib/files/types'

const createMockFile = (
  path: string,
  fileName: string,
  itemCount: number = 5
): TrackedFile => ({
  path,
  fileName,
  itemCount,
  contentHash: 'hash123',
  addedAt: '2024-01-01T00:00:00.000Z',
  lastAccessedAt: '2024-01-01T00:00:00.000Z',
})

describe('TrackedFilesList', () => {
  describe('empty state', () => {
    it('shows empty message when no files', () => {
      render(<TrackedFilesList files={[]} />)

      expect(screen.getByText('No files tracked yet.')).toBeInTheDocument()
      expect(
        screen.getByText(/Click "Add File" to start tracking/)
      ).toBeInTheDocument()
    })

    it('does not render list when empty', () => {
      render(<TrackedFilesList files={[]} />)

      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('with files', () => {
    const mockFiles = [
      createMockFile('/path/to/file1.md', 'file1.md', 5),
      createMockFile('/path/to/file2.md', 'file2.md', 10),
    ]

    it('renders list of files', () => {
      render(<TrackedFilesList files={mockFiles} />)

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('file1.md')).toBeInTheDocument()
      expect(screen.getByText('file2.md')).toBeInTheDocument()
    })

    it('shows file name for each file', () => {
      render(<TrackedFilesList files={mockFiles} />)

      expect(screen.getByText('file1.md')).toBeInTheDocument()
      expect(screen.getByText('file2.md')).toBeInTheDocument()
    })

    it('shows item count for each file', () => {
      render(<TrackedFilesList files={mockFiles} />)

      expect(screen.getByText('5 items')).toBeInTheDocument()
      expect(screen.getByText('10 items')).toBeInTheDocument()
    })

    it('uses singular "item" for count of 1', () => {
      const singleItemFile = [createMockFile('/path/single.md', 'single.md', 1)]
      render(<TrackedFilesList files={singleItemFile} />)

      expect(screen.getByText('1 item')).toBeInTheDocument()
    })

    it('truncates long paths', () => {
      const longPathFile = [
        createMockFile(
          '/Users/developer/projects/my-long-project-name/documents/markdown/file.md',
          'file.md'
        ),
      ]
      render(<TrackedFilesList files={longPathFile} />)

      // Should show truncated path with ellipsis
      const pathElement = screen.getByTitle(
        /\/Users\/developer\/projects\/my-long-project-name/
      )
      expect(pathElement.textContent).toMatch(/^\.\.\./)
    })
  })

  describe('remove functionality', () => {
    it('shows remove buttons when onRemove provided', () => {
      const mockFiles = [createMockFile('/path/file.md', 'file.md')]
      const onRemove = vi.fn()

      render(<TrackedFilesList files={mockFiles} onRemove={onRemove} />)

      expect(
        screen.getByRole('button', { name: 'Remove file.md' })
      ).toBeInTheDocument()
    })

    it('hides remove buttons when onRemove not provided', () => {
      const mockFiles = [createMockFile('/path/file.md', 'file.md')]

      render(<TrackedFilesList files={mockFiles} />)

      expect(
        screen.queryByRole('button', { name: 'Remove file.md' })
      ).not.toBeInTheDocument()
    })

    it('calls onRemove with file path when clicked', () => {
      const mockFiles = [createMockFile('/path/file.md', 'file.md')]
      const onRemove = vi.fn()

      render(<TrackedFilesList files={mockFiles} onRemove={onRemove} />)

      fireEvent.click(screen.getByRole('button', { name: 'Remove file.md' }))

      expect(onRemove).toHaveBeenCalledWith('/path/file.md')
    })
  })

  describe('selection', () => {
    const mockFiles = [
      createMockFile('/path/file1.md', 'file1.md'),
      createMockFile('/path/file2.md', 'file2.md'),
    ]

    it('calls onSelect when file info is clicked', () => {
      const onSelect = vi.fn()

      render(<TrackedFilesList files={mockFiles} onSelect={onSelect} />)

      fireEvent.click(screen.getByText('file1.md'))

      expect(onSelect).toHaveBeenCalledWith(mockFiles[0])
    })

    it('highlights selected file', () => {
      render(
        <TrackedFilesList files={mockFiles} selectedPath="/path/file1.md" />
      )

      const selectedItem = screen.getByText('file1.md').closest('li')
      expect(selectedItem).toHaveClass('selected')
    })

    it('marks selected file with selected class', () => {
      render(
        <TrackedFilesList files={mockFiles} selectedPath="/path/file1.md" />
      )

      const fileItem = screen.getByText('file1.md').closest('.tracked-file-item')
      expect(fileItem).toHaveClass('selected')
    })
  })
})

describe('Message', () => {
  it('renders error message', () => {
    render(<Message type="error" message="Something went wrong" />)

    expect(screen.getByRole('alert')).toHaveClass('message-error')
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders info message', () => {
    render(<Message type="info" message="File already tracked" />)

    expect(screen.getByRole('alert')).toHaveClass('message-info')
    expect(screen.getByText('File already tracked')).toBeInTheDocument()
  })

  it('renders success message', () => {
    render(<Message type="success" message="File added successfully" />)

    expect(screen.getByRole('alert')).toHaveClass('message-success')
    expect(screen.getByText('File added successfully')).toBeInTheDocument()
  })

  it('shows dismiss button when onDismiss provided', () => {
    const onDismiss = vi.fn()

    render(
      <Message type="info" message="Test message" onDismiss={onDismiss} />
    )

    expect(
      screen.getByRole('button', { name: 'Dismiss message' })
    ).toBeInTheDocument()
  })

  it('hides dismiss button when onDismiss not provided', () => {
    render(<Message type="info" message="Test message" />)

    expect(
      screen.queryByRole('button', { name: 'Dismiss message' })
    ).not.toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn()

    render(
      <Message type="info" message="Test message" onDismiss={onDismiss} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }))

    expect(onDismiss).toHaveBeenCalled()
  })
})
