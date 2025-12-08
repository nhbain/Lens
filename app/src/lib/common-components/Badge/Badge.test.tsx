/**
 * Tests for common Badge component.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders children content', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('has badge class', () => {
    render(<Badge>Label</Badge>)
    expect(document.querySelector('.badge')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Label</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Variant Classes
  // ==========================================================================

  it('applies default variant class by default', () => {
    render(<Badge>Label</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--default')
  })

  it('applies default variant class', () => {
    render(<Badge variant="default">Label</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--default')
  })

  it('applies success variant class', () => {
    render(<Badge variant="success">Complete</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--success')
  })

  it('applies intermediary variant class', () => {
    render(<Badge variant="intermediary">Pending</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--intermediary')
  })

  it('applies error variant class', () => {
    render(<Badge variant="error">Failed</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--error')
  })

  it('applies info variant class', () => {
    render(<Badge variant="info">Info</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--info')
  })

  // ==========================================================================
  // Size Classes
  // ==========================================================================

  it('applies medium size class by default', () => {
    render(<Badge>Label</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--size-medium')
  })

  it('applies small size class', () => {
    render(<Badge size="small">Label</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--size-small')
  })

  it('applies medium size class', () => {
    render(<Badge size="medium">Label</Badge>)
    expect(document.querySelector('.badge')).toHaveClass('badge--size-medium')
  })

  // ==========================================================================
  // Content Types
  // ==========================================================================

  it('renders text content', () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders numeric content', () => {
    render(<Badge>42</Badge>)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders complex content', () => {
    render(
      <Badge>
        <span data-testid="icon">★</span>
        Featured
      </Badge>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })
})
