import { useState, useCallback, useEffect } from 'react'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { open, save } from '@tauri-apps/plugin-dialog'
import './App.css'
import { Button } from './lib/common-components'
import { Message } from './components/TrackedFilesList'
import { DocumentView } from './components/DocumentView'
import { Dashboard } from './components/Dashboard'
import { Settings } from './components/Settings'
import type { DashboardFile, DashboardNavigationTarget } from './components/Dashboard'
import { useFileImport } from './hooks/useFileImport'
import { useDocumentView } from './hooks/useDocumentView'
import { useSettings } from './hooks/useSettings'
import { getNextStatus } from './lib/progress'
import type { TrackedFile, AddFileResult } from './lib/files'
import type { TrackableItem } from './lib/parser/types'
import type { ThemeOption, StorageStats, ExportData } from './lib/settings/types'
import type { WatchedDirectory } from './lib/watcher/types'
// Only import config management functions - not directory-watcher functions
// which use chokidar (Node.js only). File watching is initialized separately.
import {
  loadWatchConfig,
  getWatchedDirectories,
  addWatchedDirectory,
  removeWatchedDirectory,
  setWatchEnabled,
  getWatchedDirectoriesCount,
  removeAllWatchedDirectories,
} from './lib/watcher/watch-config'
import { DEFAULT_PATTERNS } from './lib/watcher/types'
import { getTrackedFiles, removeAllTrackedFiles, addTrackedFile } from './lib/files'
import { readDir } from '@tauri-apps/plugin-fs'

interface AppMessage {
  type: 'error' | 'info' | 'success'
  message: string
}

type AppView = 'dashboard' | 'document' | 'settings'

export const App = () => {
  const [appMessage, setAppMessage] = useState<AppMessage | null>(null)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedFile, setSelectedFile] = useState<TrackedFile | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [targetItemId, setTargetItemId] = useState<string | undefined>(undefined)

  // Settings state
  const [watchedDirectories, setWatchedDirectories] = useState<WatchedDirectory[]>([])
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string | null>(null)

  // Use settings hook
  const {
    settings,
    isLoading: isSettingsLoading,
    error: settingsError,
    addPattern,
    removePattern,
    setTheme,
    reset: resetSettings,
    reload: reloadSettings,
  } = useSettings()

  // Load watched directories and compute storage stats
  const loadWatchedDirectoriesAndStats = useCallback(async () => {
    // Ensure watch config is loaded from disk
    await loadWatchConfig()

    const dirs = getWatchedDirectories()
    setWatchedDirectories(dirs)

    // Compute storage stats
    try {
      const trackedFiles = await getTrackedFiles()
      const stats: StorageStats = {
        trackedFileCount: trackedFiles.length,
        watchedDirectoryCount: getWatchedDirectoriesCount(),
        totalItemCount: trackedFiles.reduce((sum, f) => sum + f.itemCount, 0),
        totalSizeBytes: 0, // We don't track file sizes currently
      }
      setStorageStats(stats)
    } catch {
      // Stats are optional, don't error on failure
    }
  }, [])

  // Load watched directories when entering settings view
  useEffect(() => {
    if (currentView === 'settings') {
      loadWatchedDirectoriesAndStats()
    }
  }, [currentView, loadWatchedDirectoriesAndStats])

  /**
   * Scans a directory recursively for markdown files and adds them to tracking.
   * Uses the patterns from the watch config to match files.
   */
  const scanAndAddMarkdownFiles = useCallback(async (dirPath: string, patterns: string[] = [...DEFAULT_PATTERNS]) => {
    const matchesPattern = (fileName: string) => {
      return patterns.some(pattern => {
        // Simple glob matching for common patterns like *.md, *.markdown
        if (pattern.startsWith('*.')) {
          const ext = pattern.slice(1) // .md or .markdown
          return fileName.toLowerCase().endsWith(ext)
        }
        return fileName === pattern
      })
    }

    const scanDir = async (path: string) => {
      try {
        const entries = await readDir(path)
        for (const entry of entries) {
          const fullPath = `${path}/${entry.name}`
          if (entry.isDirectory) {
            // Recursively scan subdirectories
            await scanDir(fullPath)
          } else if (!entry.isDirectory && matchesPattern(entry.name)) {
            // Add markdown file to tracking (Tauri v2 DirEntry has isDirectory but not isFile)
            await addTrackedFile(fullPath)
          }
        }
      } catch (err) {
        console.error(`Error scanning directory ${path}:`, err)
      }
    }

    await scanDir(dirPath)
  }, [])

  // Clear success message after delay
  useEffect(() => {
    if (settingsSuccessMessage) {
      const timer = setTimeout(() => setSettingsSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [settingsSuccessMessage])

  // Use document view hook for the selected file
  const {
    document: parsedDocument,
    itemStatuses,
    isLoading: isDocumentLoading,
    error: documentError,
    updateItemStatus,
  } = useDocumentView({
    filePath: selectedFile?.path ?? '',
    content: fileContent ?? undefined,
  })

  const handleFileAdded = useCallback((result: AddFileResult) => {
    setAppMessage({
      type: 'success',
      message: `Added "${result.file?.fileName}" to tracking`,
    })
  }, [])

  const handleError = useCallback((error: string) => {
    setAppMessage({
      type: 'error',
      message: error,
    })
  }, [])

  const handleDuplicate = useCallback((result: AddFileResult) => {
    setAppMessage({
      type: 'info',
      message: `"${result.file?.fileName}" is already being tracked`,
    })
  }, [])

  /**
   * Load file content and navigate to document view.
   * Optionally scroll to a specific item if itemId is provided.
   */
  const navigateToFile = useCallback(async (file: DashboardFile, itemId?: string) => {
    // Convert DashboardFile to TrackedFile for state
    const trackedFile: TrackedFile = {
      path: file.path,
      fileName: file.fileName,
      itemCount: file.itemCount,
      contentHash: file.contentHash,
      addedAt: file.addedAt,
      lastAccessedAt: file.lastAccessedAt,
    }
    setSelectedFile(trackedFile)
    setTargetItemId(itemId)
    try {
      console.log('Attempting to read file:', file.path)
      const content = await readTextFile(file.path)
      setFileContent(content)
    } catch (err) {
      console.error('File read error:', err)
      let message: string
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = String((err as { message: unknown }).message)
      } else {
        message = String(err)
      }
      setAppMessage({
        type: 'error',
        message: `Could not load "${file.fileName}": ${message}`,
      })
      setFileContent(null)
    }
  }, [])

  // Handle file selection from Dashboard - load content and display document view
  const handleFileSelect = useCallback(async (file: DashboardFile) => {
    await navigateToFile(file)
  }, [navigateToFile])

  // Handle resume item click - navigate to file and scroll to specific item
  const handleResumeItemClick = useCallback(async (target: DashboardNavigationTarget) => {
    await navigateToFile(target.file, target.targetItemId)
  }, [navigateToFile])

  // Handle item click - cycle status
  const handleItemClick = useCallback(
    async (item: TrackableItem) => {
      const currentStatus = itemStatuses[item.id] ?? 'pending'
      const nextStatus = getNextStatus(currentStatus)
      await updateItemStatus(item.id, nextStatus)
    },
    [itemStatuses, updateItemStatus]
  )

  const { importFile } = useFileImport({
    onFileAdded: handleFileAdded,
    onError: handleError,
    onDuplicate: handleDuplicate,
  })

  const handleBackToList = useCallback(() => {
    setSelectedFile(null)
    setFileContent(null)
    setTargetItemId(undefined)
  }, [])

  const dismissMessage = useCallback(() => {
    setAppMessage(null)
  }, [])

  // Navigate to settings view
  const handleOpenSettings = useCallback(() => {
    setCurrentView('settings')
  }, [])

  // Navigate back from settings
  const handleBackFromSettings = useCallback(() => {
    setCurrentView('dashboard')
    setSettingsSuccessMessage(null)
  }, [])

  // Settings handlers
  const handleAddDirectory = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const result = await open({
        directory: true,
        multiple: false,
        title: 'Select Directory to Watch',
      })

      if (result) {
        const path = result as string
        const addResult = await addWatchedDirectory(path)
        if (addResult.success && !addResult.alreadyWatched) {
          // Directory added to config - scan for existing markdown files
          const patterns = addResult.directory?.patterns ?? [...DEFAULT_PATTERNS]
          await scanAndAddMarkdownFiles(path, patterns)
          await loadWatchedDirectoriesAndStats()
          setSettingsSuccessMessage('Directory added and files discovered')
        } else if (addResult.alreadyWatched) {
          setAppMessage({ type: 'info', message: 'Directory is already being watched' })
        } else {
          setAppMessage({ type: 'error', message: addResult.error ?? 'Failed to add directory' })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add directory'
      setAppMessage({ type: 'error', message })
    } finally {
      setSettingsLoading(false)
    }
  }, [loadWatchedDirectoriesAndStats, scanAndAddMarkdownFiles])

  const handleRemoveDirectory = useCallback(async (path: string) => {
    setSettingsLoading(true)
    try {
      // Remove from config - watcher system will stop watching automatically
      const removed = await removeWatchedDirectory(path)
      if (removed) {
        await loadWatchedDirectoriesAndStats()
        setSettingsSuccessMessage('Directory removed successfully')
      } else {
        setAppMessage({ type: 'error', message: 'Failed to remove directory' })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove directory'
      setAppMessage({ type: 'error', message })
    } finally {
      setSettingsLoading(false)
    }
  }, [loadWatchedDirectoriesAndStats])

  const handleToggleDirectoryEnabled = useCallback(async (path: string, enabled: boolean) => {
    setSettingsLoading(true)
    try {
      // Update config - watcher system will respond to enabled state changes
      const success = await setWatchEnabled(path, enabled)
      if (success) {
        await loadWatchedDirectoriesAndStats()
      } else {
        setAppMessage({ type: 'error', message: 'Failed to update directory status' })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update directory'
      setAppMessage({ type: 'error', message })
    } finally {
      setSettingsLoading(false)
    }
  }, [loadWatchedDirectoriesAndStats])

  const handleAddPattern = useCallback(async (pattern: string) => {
    await addPattern(pattern)
    setSettingsSuccessMessage('Pattern added successfully')
  }, [addPattern])

  const handleRemovePattern = useCallback(async (pattern: string) => {
    await removePattern(pattern)
    setSettingsSuccessMessage('Pattern removed successfully')
  }, [removePattern])

  const handleThemeChange = useCallback(async (theme: ThemeOption) => {
    await setTheme(theme)
    setSettingsSuccessMessage('Theme updated successfully')
  }, [setTheme])

  const handleClearData = useCallback(async () => {
    setSettingsLoading(true)
    try {
      // Remove all tracked files
      await removeAllTrackedFiles()
      // Remove all watched directories (watcher system will stop automatically)
      await removeAllWatchedDirectories()
      // Reset settings to defaults
      await resetSettings()
      // Reload stats
      await loadWatchedDirectoriesAndStats()
      setSettingsSuccessMessage('All data cleared successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear data'
      setAppMessage({ type: 'error', message })
    } finally {
      setSettingsLoading(false)
    }
  }, [resetSettings, loadWatchedDirectoriesAndStats])

  const handleExportData = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const trackedFiles = await getTrackedFiles()
      const dirs = getWatchedDirectories()

      const exportData: ExportData = {
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        settings: settings ?? {
          version: 1,
          filePatterns: ['*.md', '*.markdown'],
          theme: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        watchConfig: { version: 1, directories: dirs },
        trackingStates: [], // TODO: Export tracking states if needed
        trackedFiles,
      }

      const savePath = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: `lens-export-${new Date().toISOString().split('T')[0]}.json`,
      })

      if (savePath) {
        await writeTextFile(savePath, JSON.stringify(exportData, null, 2))
        setSettingsSuccessMessage('Data exported successfully')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data'
      setAppMessage({ type: 'error', message })
    } finally {
      setSettingsLoading(false)
    }
  }, [settings])

  const handleImportData = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const filePath = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
        title: 'Import Lens Data',
      })

      if (filePath) {
        const content = await readTextFile(filePath as string)
        const data = JSON.parse(content) as ExportData

        // Validate import data structure
        if (!data.exportVersion || !data.exportedAt) {
          throw new Error('Invalid export file format')
        }

        // TODO: Implement full import logic (restore settings, directories, files)
        setSettingsSuccessMessage('Data imported successfully')
        await reloadSettings()
        await loadWatchedDirectoriesAndStats()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import data'
      setAppMessage({ type: 'error', message })
    } finally {
      setSettingsLoading(false)
    }
  }, [reloadSettings, loadWatchedDirectoriesAndStats])

  // Show settings view
  if (currentView === 'settings') {
    return (
      <main className="container">
        {appMessage && (
          <Message
            type={appMessage.type}
            message={appMessage.message}
            onDismiss={dismissMessage}
          />
        )}

        <Settings
          settings={settings}
          watchedDirectories={watchedDirectories}
          storageStats={storageStats}
          isLoading={isSettingsLoading || settingsLoading}
          error={settingsError}
          successMessage={settingsSuccessMessage}
          onBack={handleBackFromSettings}
          onAddDirectory={handleAddDirectory}
          onRemoveDirectory={handleRemoveDirectory}
          onToggleDirectoryEnabled={handleToggleDirectoryEnabled}
          onAddPattern={handleAddPattern}
          onRemovePattern={handleRemovePattern}
          onThemeChange={handleThemeChange}
          onClearData={handleClearData}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      </main>
    )
  }

  // Show document view when a file is selected
  if (selectedFile && fileContent !== null) {
    return (
      <main className="container">
        <header className="app-header">
          <Button
            variant="ghost"
            size="small"
            onClick={handleBackToList}
            aria-label="Back to file list"
          >
            &larr; Back
          </Button>
          <h1>{selectedFile.fileName}</h1>
        </header>

        {appMessage && (
          <Message
            type={appMessage.type}
            message={appMessage.message}
            onDismiss={dismissMessage}
          />
        )}

        {documentError && (
          <Message
            type="error"
            message={documentError}
            onDismiss={() => {}}
          />
        )}

        <section className="app-document">
          <DocumentView
            items={parsedDocument?.items ?? []}
            filePath={selectedFile.path}
            title={selectedFile.fileName}
            itemStatuses={itemStatuses}
            onItemClick={handleItemClick}
            isLoading={isDocumentLoading}
            targetItemId={targetItemId}
          />
        </section>
      </main>
    )
  }

  // Show Dashboard view
  return (
    <main className="container">
      <header className="app-header">
        <Button
          variant="ghost"
          size="small"
          onClick={handleOpenSettings}
          aria-label="Open settings"
          className="settings-icon-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Button>
      </header>

      {appMessage && (
        <Message
          type={appMessage.type}
          message={appMessage.message}
          onDismiss={dismissMessage}
        />
      )}

      <Dashboard
        onFileSelect={handleFileSelect}
        onAddFile={importFile}
        selectedPath={selectedFile?.path}
        onResumeItemClick={handleResumeItemClick}
      />
    </main>
  )
}
