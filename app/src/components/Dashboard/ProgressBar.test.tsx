/**
 * Tests for the ProgressBar component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<ProgressBar percentage={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
    })

    it('renders the fill element', () => {
      render(<ProgressBar percentage={50} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toBeInTheDocument()
    })

    it('does not show label by default', () => {
      render(<ProgressBar percentage={50} />)
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    it('shows label when showLabel is true', () => {
      render(<ProgressBar percentage={50} showLabel />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })

  describe('percentage handling', () => {
    it('sets correct width for percentage', () => {
      render(<ProgressBar percentage={75} />)
      const fill = document.querySelector('.progress-bar__fill') as HTMLElement
      expect(fill.style.width).toBe('75%')
    })

    it('clamps percentage to 0 when negative', () => {
      render(<ProgressBar percentage={-10} showLabel />)
      const fill = document.querySelector('.progress-bar__fill') as HTMLElement
      expect(fill.style.width).toBe('0%')
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('clamps percentage to 100 when over 100', () => {
      render(<ProgressBar percentage={150} showLabel />)
      const fill = document.querySelector('.progress-bar__fill') as HTMLElement
      expect(fill.style.width).toBe('100%')
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('handles 0 percentage', () => {
      render(<ProgressBar percentage={0} showLabel />)
      const fill = document.querySelector('.progress-bar__fill') as HTMLElement
      expect(fill.style.width).toBe('0%')
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('handles 100 percentage', () => {
      render(<ProgressBar percentage={100} showLabel />)
      const fill = document.querySelector('.progress-bar__fill') as HTMLElement
      expect(fill.style.width).toBe('100%')
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has correct aria attributes', () => {
      render(<ProgressBar percentage={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
      expect(progressbar).toHaveAttribute('aria-label', 'Progress: 50%')
    })

    it('updates aria-valuenow when percentage changes', () => {
      const { rerender } = render(<ProgressBar percentage={25} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')

      rerender(<ProgressBar percentage={75} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
    })
  })

  describe('color classes', () => {
    it('applies low color class for 0-33%', () => {
      render(<ProgressBar percentage={20} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--low')
    })

    it('applies medium color class for 34-66%', () => {
      render(<ProgressBar percentage={50} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--medium')
    })

    it('applies high color class for 67-99%', () => {
      render(<ProgressBar percentage={80} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--high')
    })

    it('applies complete color class for 100%', () => {
      render(<ProgressBar percentage={100} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--complete')
    })

    it('applies low class at boundary (33%)', () => {
      render(<ProgressBar percentage={33} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--low')
    })

    it('applies medium class at boundary (34%)', () => {
      render(<ProgressBar percentage={34} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--medium')
    })

    it('applies medium class at boundary (66%)', () => {
      render(<ProgressBar percentage={66} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--medium')
    })

    it('applies high class at boundary (67%)', () => {
      render(<ProgressBar percentage={67} />)
      const fill = document.querySelector('.progress-bar__fill')
      expect(fill).toHaveClass('progress-bar__fill--high')
    })
  })

  describe('size variants', () => {
    it('applies small size class', () => {
      render(<ProgressBar percentage={50} size="small" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('progress-bar--small')
    })

    it('applies medium size class by default', () => {
      render(<ProgressBar percentage={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('progress-bar--medium')
    })

    it('applies large size class', () => {
      render(<ProgressBar percentage={50} size="large" />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('progress-bar--large')
    })
  })

  describe('animation', () => {
    it('applies animated class by default', () => {
      render(<ProgressBar percentage={50} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveClass('progress-bar--animated')
    })

    it('does not apply animated class when disabled', () => {
      render(<ProgressBar percentage={50} animated={false} />)
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).not.toHaveClass('progress-bar--animated')
    })
  })
})
