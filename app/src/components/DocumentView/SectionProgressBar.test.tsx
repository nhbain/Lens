/**
 * Tests for SectionProgressBar component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionProgressBar } from './SectionProgressBar'

describe('SectionProgressBar', () => {
  it('renders nothing when total is 0', () => {
    const { container } = render(
      <SectionProgressBar completed={0} total={0} percentage={0} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders progress bar with correct aria attributes', () => {
    render(<SectionProgressBar completed={3} total={10} percentage={30} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '30')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-label', '3 of 10 complete')
  })

  it('displays completion text in correct format', () => {
    render(<SectionProgressBar completed={5} total={7} percentage={71} />)

    expect(screen.getByText('5 of 7 complete')).toBeInTheDocument()
  })

  it('applies complete class at 100%', () => {
    render(<SectionProgressBar completed={10} total={10} percentage={100} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveClass('section-progress--complete')
  })

  it('applies complete class when isComplete is true', () => {
    render(<SectionProgressBar completed={9} total={10} percentage={90} isComplete />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveClass('section-progress--complete')
  })

  it('does not apply complete class at partial progress', () => {
    render(<SectionProgressBar completed={5} total={10} percentage={50} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).not.toHaveClass('section-progress--complete')
  })

  it('sets fill width based on percentage', () => {
    render(<SectionProgressBar completed={7} total={10} percentage={70} />)

    const fill = document.querySelector('.section-progress-fill')
    expect(fill).toHaveStyle({ width: '70%' })
  })

  it('renders 0% progress correctly', () => {
    render(<SectionProgressBar completed={0} total={5} percentage={0} />)

    expect(screen.getByText('0 of 5 complete')).toBeInTheDocument()
    const fill = document.querySelector('.section-progress-fill')
    expect(fill).toHaveStyle({ width: '0%' })
  })

  it('renders 100% progress correctly', () => {
    render(<SectionProgressBar completed={5} total={5} percentage={100} />)

    expect(screen.getByText('5 of 5 complete')).toBeInTheDocument()
    const fill = document.querySelector('.section-progress-fill')
    expect(fill).toHaveStyle({ width: '100%' })
  })

  it('accepts custom className', () => {
    render(
      <SectionProgressBar
        completed={3}
        total={5}
        percentage={60}
        className="custom-class"
      />
    )

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveClass('section-progress', 'custom-class')
  })

  it('renders with large numbers', () => {
    render(<SectionProgressBar completed={999} total={1000} percentage={99} />)

    expect(screen.getByText('999 of 1000 complete')).toBeInTheDocument()
  })

  it('handles 1 of 1 complete', () => {
    render(<SectionProgressBar completed={1} total={1} percentage={100} />)

    expect(screen.getByText('1 of 1 complete')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveClass('section-progress--complete')
  })
})
