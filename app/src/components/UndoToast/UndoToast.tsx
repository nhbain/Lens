/**
 * UndoToast component.
 * Shows a brief toast notification with an undo action.
 */

import './UndoToast.css'

export interface UndoToastProps {
  /** Message to display */
  message: string
  /** Remaining time in milliseconds before auto-dismiss */
  remainingMs: number
  /** Callback when undo button is clicked */
  onUndo: () => void
  /** Callback when toast is dismissed */
  onDismiss: () => void
}

/**
 * Toast component that displays a status change notification with undo option.
 */
export const UndoToast = ({
  message,
  remainingMs,
  onUndo,
  onDismiss,
}: UndoToastProps) => {
  const remainingSeconds = Math.ceil(remainingMs / 1000)

  return (
    <div className="undo-toast" role="alert" aria-live="polite">
      <span className="undo-toast-message">{message}</span>
      <div className="undo-toast-actions">
        <button
          type="button"
          className="undo-toast-undo-button"
          onClick={onUndo}
          aria-label={`Undo, ${remainingSeconds} seconds remaining`}
        >
          Undo ({remainingSeconds}s)
        </button>
        <button
          type="button"
          className="undo-toast-dismiss-button"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
