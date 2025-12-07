/**
 * Common Tooltip component for hover hints.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import './Tooltip.css'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** Tooltip text content */
  content: string
  /** Position relative to trigger element */
  position?: TooltipPosition
  /** Element that triggers the tooltip */
  children: React.ReactElement
  /** Delay in ms before showing tooltip */
  delay?: number
  /** Additional CSS class names */
  className?: string
}

/**
 * Reusable tooltip component for showing contextual hints on hover.
 * Renders via portal to avoid overflow issues.
 */
export const Tooltip = ({
  content,
  position = 'top',
  children,
  delay = 200,
  className = '',
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  const updatePosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = rect.top + scrollY - 8
        left = rect.left + scrollX + rect.width / 2
        break
      case 'bottom':
        top = rect.bottom + scrollY + 8
        left = rect.left + scrollX + rect.width / 2
        break
      case 'left':
        top = rect.top + scrollY + rect.height / 2
        left = rect.left + scrollX - 8
        break
      case 'right':
        top = rect.top + scrollY + rect.height / 2
        left = rect.right + scrollX + 8
        break
    }

    setCoords({ top, left })
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      updatePosition()
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const classNames = [
    'tooltip',
    `tooltip--${position}`,
    isVisible ? 'tooltip--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div
        ref={triggerRef}
        className="tooltip__trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className={classNames}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
            <div className="tooltip__arrow" />
          </div>,
          document.body
        )}
    </>
  )
}
