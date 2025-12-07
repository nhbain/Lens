/**
 * DataManagementSection component.
 * Provides controls for clearing, exporting, and importing data.
 */

import { useState } from 'react'
import { Button } from '../../lib/common-components'
import type { DataManagementSectionProps } from './types'

/**
 * Formats bytes to a human-readable string.
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Component for data management operations.
 */
export const DataManagementSection = ({
  stats,
  onClearData,
  onExportData,
  onImportData,
  isLoading = false,
  error,
  successMessage,
}: DataManagementSectionProps) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClearClick = () => {
    setShowClearConfirm(true)
  }

  const handleClearConfirm = async () => {
    await onClearData()
    setShowClearConfirm(false)
  }

  const handleClearCancel = () => {
    setShowClearConfirm(false)
  }

  const handleExportClick = async () => {
    await onExportData()
  }

  const handleImportClick = async () => {
    await onImportData()
  }

  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">Data Management</h2>
        <p className="settings-section__description">
          Manage your tracking data and app state
        </p>
      </div>

      {error && (
        <div className="settings-section__error" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="settings-section__success" role="status">
          {successMessage}
        </div>
      )}

      <div className="data-management">
        {/* Storage Statistics */}
        {stats && (
          <div className="data-management__stats">
            <h3 className="data-management__stats-title">Storage Usage</h3>
            <dl className="data-management__stats-list">
              <div className="data-management__stat">
                <dt>Tracked Files</dt>
                <dd>{stats.trackedFileCount}</dd>
              </div>
              <div className="data-management__stat">
                <dt>Watched Directories</dt>
                <dd>{stats.watchedDirectoryCount}</dd>
              </div>
              <div className="data-management__stat">
                <dt>Total Items</dt>
                <dd>{stats.totalItemCount}</dd>
              </div>
              <div className="data-management__stat">
                <dt>Data Size</dt>
                <dd>{formatBytes(stats.totalSizeBytes)}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Export/Import Section */}
        <div className="data-management__actions">
          <div className="data-management__action">
            <h3 className="data-management__action-title">Export Data</h3>
            <p className="data-management__action-description">
              Save all tracking data to a JSON file for backup
            </p>
            <Button
              variant="outline"
              onClick={handleExportClick}
              disabled={isLoading}
            >
              Export Data
            </Button>
          </div>

          <div className="data-management__action">
            <h3 className="data-management__action-title">Import Data</h3>
            <p className="data-management__action-description">
              Restore tracking data from a previous export
            </p>
            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={isLoading}
            >
              Import Data
            </Button>
          </div>

          <div className="data-management__action data-management__action--danger">
            <h3 className="data-management__action-title">Clear All Data</h3>
            <p className="data-management__action-description">
              Remove all tracking data. This cannot be undone.
            </p>
            <Button
              variant="ghost-danger"
              onClick={handleClearClick}
              disabled={isLoading || showClearConfirm}
            >
              Clear All Data
            </Button>
          </div>
        </div>

        {/* Clear Confirmation Dialog */}
        {showClearConfirm && (
          <div
            className="data-management__confirm"
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <h4 id="confirm-title" className="data-management__confirm-title">
              Confirm Clear Data
            </h4>
            <p id="confirm-description" className="data-management__confirm-text">
              Are you sure you want to clear all tracking data? This will remove
              all progress tracking and cannot be undone.
            </p>
            <div className="data-management__confirm-actions">
              <Button
                variant="secondary"
                onClick={handleClearCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleClearConfirm}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Yes, Clear All
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
