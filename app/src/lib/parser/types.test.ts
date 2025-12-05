import { describe, it, expect } from 'vitest'
import {
  isTrackableItemType,
  isTrackingStatus,
  isPosition,
  isTrackableItem,
  isParsedDocument,
  type TrackableItem,
  type ParsedDocument,
} from './types'

describe('Type Guards', () => {
  describe('isTrackableItemType', () => {
    it('returns true for valid types', () => {
      expect(isTrackableItemType('header')).toBe(true)
      expect(isTrackableItemType('listItem')).toBe(true)
      expect(isTrackableItemType('checkbox')).toBe(true)
    })

    it('returns false for invalid types', () => {
      expect(isTrackableItemType('invalid')).toBe(false)
      expect(isTrackableItemType('')).toBe(false)
      expect(isTrackableItemType(null)).toBe(false)
      expect(isTrackableItemType(undefined)).toBe(false)
      expect(isTrackableItemType(123)).toBe(false)
    })
  })

  describe('isTrackingStatus', () => {
    it('returns true for valid statuses', () => {
      expect(isTrackingStatus('pending')).toBe(true)
      expect(isTrackingStatus('in_progress')).toBe(true)
      expect(isTrackingStatus('complete')).toBe(true)
    })

    it('returns false for invalid statuses', () => {
      expect(isTrackingStatus('done')).toBe(false)
      expect(isTrackingStatus('')).toBe(false)
      expect(isTrackingStatus(null)).toBe(false)
    })
  })

  describe('isPosition', () => {
    it('returns true for valid positions', () => {
      expect(isPosition({ line: 1, column: 1 })).toBe(true)
      expect(isPosition({ line: 100, column: 50 })).toBe(true)
    })

    it('returns false for invalid positions', () => {
      expect(isPosition(null)).toBe(false)
      expect(isPosition(undefined)).toBe(false)
      expect(isPosition({})).toBe(false)
      expect(isPosition({ line: 1 })).toBe(false)
      expect(isPosition({ column: 1 })).toBe(false)
      expect(isPosition({ line: '1', column: 1 })).toBe(false)
    })
  })

  describe('isTrackableItem', () => {
    const validItem: TrackableItem = {
      id: 'abc123',
      type: 'header',
      content: 'Test Header',
      depth: 1,
      position: { line: 1, column: 1 },
      children: [],
    }

    it('returns true for valid items', () => {
      expect(isTrackableItem(validItem)).toBe(true)
    })

    it('returns true for checkbox items with checked property', () => {
      const checkbox: TrackableItem = {
        ...validItem,
        type: 'checkbox',
        checked: true,
      }
      expect(isTrackableItem(checkbox)).toBe(true)
    })

    it('returns true for list items with ordered property', () => {
      const listItem: TrackableItem = {
        ...validItem,
        type: 'listItem',
        ordered: true,
      }
      expect(isTrackableItem(listItem)).toBe(true)
    })

    it('returns true for items with children', () => {
      const itemWithChildren: TrackableItem = {
        ...validItem,
        children: [
          {
            id: 'child1',
            type: 'listItem',
            content: 'Child item',
            depth: 1,
            position: { line: 2, column: 1 },
            children: [],
          },
        ],
      }
      expect(isTrackableItem(itemWithChildren)).toBe(true)
    })

    it('returns false for invalid items', () => {
      expect(isTrackableItem(null)).toBe(false)
      expect(isTrackableItem(undefined)).toBe(false)
      expect(isTrackableItem({})).toBe(false)
      expect(isTrackableItem({ ...validItem, id: 123 })).toBe(false)
      expect(isTrackableItem({ ...validItem, type: 'invalid' })).toBe(false)
      expect(isTrackableItem({ ...validItem, children: 'not an array' })).toBe(false)
    })
  })

  describe('isParsedDocument', () => {
    const validDoc: ParsedDocument = {
      items: [],
      tree: [],
      parsedAt: new Date(),
      itemCount: 0,
    }

    it('returns true for valid documents', () => {
      expect(isParsedDocument(validDoc)).toBe(true)
    })

    it('returns true for documents with sourcePath', () => {
      const docWithPath: ParsedDocument = {
        ...validDoc,
        sourcePath: '/path/to/file.md',
      }
      expect(isParsedDocument(docWithPath)).toBe(true)
    })

    it('returns false for invalid documents', () => {
      expect(isParsedDocument(null)).toBe(false)
      expect(isParsedDocument(undefined)).toBe(false)
      expect(isParsedDocument({})).toBe(false)
      expect(isParsedDocument({ ...validDoc, items: 'not an array' })).toBe(false)
      expect(isParsedDocument({ ...validDoc, parsedAt: 'not a date' })).toBe(false)
      expect(isParsedDocument({ ...validDoc, itemCount: 'not a number' })).toBe(false)
    })
  })
})
