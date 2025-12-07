/**
 * ResetThemeModal component.
 * Confirmation modal for resetting theme settings to defaults.
 */

import { Button, Modal } from '@/lib/common-components'
import type { ResetThemeModalProps } from './types'
import './ResetThemeModal.css'

/**
 * Modal dialog for confirming theme reset action.
 */
export const ResetThemeModal = ({
  isOpen,
  onClose,
  onConfirm,
}: ResetThemeModalProps) => {
  const handleConfirm = async () => {
    const success = await onConfirm()
    if (success) {
      onClose()
    }
    // If not successful, keep modal open so user sees the error
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Theme Settings"
      size="small"
    >
      <p className="reset-theme-modal__message">
        Reset theme settings to defaults? This will restore the original colors
        and animation settings.
      </p>
      <div className="reset-theme-modal__actions">
        <Button variant="ghost" size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="ghost-danger" size="small" onClick={handleConfirm}>
          Reset
        </Button>
      </div>
    </Modal>
  )
}
