/**
 * Tests for FileImportButton component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FileImportButton } from './FileImportButton'

describe('FileImportButton', () => {
  it('renders with default text', () => {
    render(<FileImportButton />)
    expect(screen.getByRole('button', { name: 'Add File' })).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<FileImportButton buttonText="Import Markdown" />)
    expect(
      screen.getByRole('button', { name: 'Import Markdown' })
    ).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<FileImportButton disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<FileImportButton isLoading />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading text when isLoading is true', () => {
    render(<FileImportButton isLoading />)
    expect(screen.getByRole('button')).toHaveTextContent('Loading...')
  })

  it('has aria-busy attribute when loading', () => {
    render(<FileImportButton isLoading />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('does not have aria-busy attribute when not loading', () => {
    render(<FileImportButton />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false')
  })

  it('calls onClick when clicked and not disabled or loading', () => {
    const onClick = vi.fn().mockResolvedValue(undefined)

    render(<FileImportButton onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()

    render(<FileImportButton onClick={onClick} disabled />)
    fireEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const onClick = vi.fn()

    render(<FileImportButton onClick={onClick} isLoading />)
    fireEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when onClick is not provided', () => {
    // Should not throw
    render(<FileImportButton />)
    fireEvent.click(screen.getByRole('button'))
  })
})
