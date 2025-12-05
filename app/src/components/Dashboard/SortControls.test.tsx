/**
 * Tests for the SortControls component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SortControls } from './SortControls'
import type { SortConfig } from './types'

describe('SortControls', () => {
  const defaultConfig: SortConfig = {
    option: 'name',
    direction: 'asc',
  }

  describe('rendering', () => {
    it('renders sort label', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)
      expect(screen.getByText('Sort by:')).toBeInTheDocument()
    })

    it('renders select dropdown', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders direction toggle button', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders all sort options', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)

      expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Progress' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Last Worked' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Items' })).toBeInTheDocument()
    })
  })

  describe('current state display', () => {
    it('shows current sort option as selected', () => {
      render(<SortControls sortConfig={{ option: 'progress', direction: 'asc' }} onSortChange={vi.fn()} />)
      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('progress')
    })

    it('shows ascending icon when direction is asc', () => {
      render(<SortControls sortConfig={{ option: 'name', direction: 'asc' }} onSortChange={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveTextContent('↑')
    })

    it('shows descending icon when direction is desc', () => {
      render(<SortControls sortConfig={{ option: 'name', direction: 'desc' }} onSortChange={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveTextContent('↓')
    })
  })

  describe('sort option changes', () => {
    it('calls onSortChange with new option when select changes', () => {
      const handleChange = vi.fn()
      render(<SortControls sortConfig={defaultConfig} onSortChange={handleChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'progress' } })

      expect(handleChange).toHaveBeenCalledWith({
        option: 'progress',
        direction: 'asc',
      })
    })

    it('preserves direction when changing option', () => {
      const handleChange = vi.fn()
      render(<SortControls sortConfig={{ option: 'name', direction: 'desc' }} onSortChange={handleChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'items' } })

      expect(handleChange).toHaveBeenCalledWith({
        option: 'items',
        direction: 'desc',
      })
    })

    it('handles all sort option values', () => {
      const handleChange = vi.fn()
      render(<SortControls sortConfig={defaultConfig} onSortChange={handleChange} />)

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'date' } })
      expect(handleChange).toHaveBeenLastCalledWith({ option: 'date', direction: 'asc' })

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'items' } })
      expect(handleChange).toHaveBeenLastCalledWith({ option: 'items', direction: 'asc' })
    })
  })

  describe('direction toggle', () => {
    it('toggles from asc to desc when clicked', () => {
      const handleChange = vi.fn()
      render(<SortControls sortConfig={{ option: 'name', direction: 'asc' }} onSortChange={handleChange} />)

      fireEvent.click(screen.getByRole('button'))

      expect(handleChange).toHaveBeenCalledWith({
        option: 'name',
        direction: 'desc',
      })
    })

    it('toggles from desc to asc when clicked', () => {
      const handleChange = vi.fn()
      render(<SortControls sortConfig={{ option: 'name', direction: 'desc' }} onSortChange={handleChange} />)

      fireEvent.click(screen.getByRole('button'))

      expect(handleChange).toHaveBeenCalledWith({
        option: 'name',
        direction: 'asc',
      })
    })

    it('preserves option when toggling direction', () => {
      const handleChange = vi.fn()
      render(<SortControls sortConfig={{ option: 'progress', direction: 'asc' }} onSortChange={handleChange} />)

      fireEvent.click(screen.getByRole('button'))

      expect(handleChange).toHaveBeenCalledWith({
        option: 'progress',
        direction: 'desc',
      })
    })
  })

  describe('accessibility', () => {
    it('has group role with aria-label', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)
      expect(screen.getByRole('group', { name: 'Sort options' })).toBeInTheDocument()
    })

    it('select has aria-label', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Sort by field')
    })

    it('direction button has descriptive aria-label for ascending', () => {
      render(<SortControls sortConfig={{ option: 'name', direction: 'asc' }} onSortChange={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Sort direction: Ascending. Click to toggle.'
      )
    })

    it('direction button has descriptive aria-label for descending', () => {
      render(<SortControls sortConfig={{ option: 'name', direction: 'desc' }} onSortChange={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Sort direction: Descending. Click to toggle.'
      )
    })

    it('direction button has title tooltip', () => {
      render(<SortControls sortConfig={{ option: 'name', direction: 'asc' }} onSortChange={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Sort Ascending')
    })

    it('label is associated with select', () => {
      render(<SortControls sortConfig={defaultConfig} onSortChange={vi.fn()} />)
      const label = screen.getByText('Sort by:')
      const select = screen.getByRole('combobox')
      expect(label).toHaveAttribute('for', 'sort-select')
      expect(select).toHaveAttribute('id', 'sort-select')
    })
  })
})
