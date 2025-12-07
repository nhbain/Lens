/**
 * Tests for common Card component.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders children content', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('has card class', () => {
    render(<Card>Content</Card>)
    expect(document.querySelector('.card')).toBeInTheDocument()
  })

  it('has card body class', () => {
    render(<Card>Content</Card>)
    expect(document.querySelector('.card__body')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    expect(document.querySelector('.card')).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Header Section
  // ==========================================================================

  it('renders header when provided', () => {
    render(<Card header="Card Header">Content</Card>)
    expect(screen.getByText('Card Header')).toBeInTheDocument()
  })

  it('has header class when header provided', () => {
    render(<Card header="Header">Content</Card>)
    expect(document.querySelector('.card__header')).toBeInTheDocument()
  })

  it('does not render header section when not provided', () => {
    render(<Card>Content</Card>)
    expect(document.querySelector('.card__header')).not.toBeInTheDocument()
  })

  it('renders complex header content', () => {
    render(
      <Card header={<span data-testid="complex-header">Complex Header</span>}>
        Content
      </Card>
    )
    expect(screen.getByTestId('complex-header')).toBeInTheDocument()
  })

  // ==========================================================================
  // Footer Section
  // ==========================================================================

  it('renders footer when provided', () => {
    render(<Card footer="Card Footer">Content</Card>)
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('has footer class when footer provided', () => {
    render(<Card footer="Footer">Content</Card>)
    expect(document.querySelector('.card__footer')).toBeInTheDocument()
  })

  it('does not render footer section when not provided', () => {
    render(<Card>Content</Card>)
    expect(document.querySelector('.card__footer')).not.toBeInTheDocument()
  })

  it('renders complex footer content', () => {
    render(
      <Card footer={<button>Save</button>}>Content</Card>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  // ==========================================================================
  // Hoverable State
  // ==========================================================================

  it('does not have hoverable class by default', () => {
    render(<Card>Content</Card>)
    expect(document.querySelector('.card')).not.toHaveClass('card--hoverable')
  })

  it('has hoverable class when hoverable is true', () => {
    render(<Card hoverable>Content</Card>)
    expect(document.querySelector('.card')).toHaveClass('card--hoverable')
  })

  // ==========================================================================
  // Full Card Structure
  // ==========================================================================

  it('renders all sections in correct order', () => {
    render(
      <Card header="Header" footer="Footer">
        Body
      </Card>
    )

    const card = document.querySelector('.card')
    const children = card?.children

    expect(children?.[0]).toHaveClass('card__header')
    expect(children?.[1]).toHaveClass('card__body')
    expect(children?.[2]).toHaveClass('card__footer')
  })
})
