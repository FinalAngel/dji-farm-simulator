// Tiny JSON-file persistence. No native deps (keeps `npm install` painless across
// machines) and plenty fast for thousands of flights/detections. Each collection
// is one file under userData/data, cached in memory and written on mutation.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Detection, Field, Flight } from '../shared/types'
import { dataDir } from './paths'

class Collection<T extends { id: string }> {
  private items: T[] = []
  private loaded = false
  constructor(private file: string) {}

  private path(): string {
    return join(dataDir(), this.file)
  }

  private load(): void {
    if (this.loaded) return
    const p = this.path()
    if (existsSync(p)) {
      try {
        this.items = JSON.parse(readFileSync(p, 'utf8'))
      } catch {
        this.items = []
      }
    }
    this.loaded = true
  }

  private persist(): void {
    writeFileSync(this.path(), JSON.stringify(this.items, null, 2))
  }

  all(): T[] {
    this.load()
    return [...this.items]
  }

  find(predicate: (t: T) => boolean): T | undefined {
    this.load()
    return this.items.find(predicate)
  }

  get(id: string): T | undefined {
    return this.find((t) => t.id === id)
  }

  insert(item: T): T {
    this.load()
    this.items.push(item)
    this.persist()
    return item
  }

  update(id: string, patch: Partial<T>): T | undefined {
    this.load()
    const idx = this.items.findIndex((t) => t.id === id)
    if (idx === -1) return undefined
    this.items[idx] = { ...this.items[idx], ...patch }
    this.persist()
    return this.items[idx]
  }

  remove(id: string): boolean {
    this.load()
    const before = this.items.length
    this.items = this.items.filter((t) => t.id !== id)
    if (this.items.length === before) return false
    this.persist()
    return true
  }

  removeWhere(predicate: (t: T) => boolean): number {
    this.load()
    const before = this.items.length
    this.items = this.items.filter((t) => !predicate(t))
    const removed = before - this.items.length
    if (removed) this.persist()
    return removed
  }

  insertMany(many: T[]): void {
    this.load()
    this.items.push(...many)
    this.persist()
  }
}

export const fields = new Collection<Field>('fields.json')
export const flights = new Collection<Flight>('flights.json')
export const detections = new Collection<Detection>('detections.json')
