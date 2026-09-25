import type DataManager from './DataManager'

// Lazy singleton wrapper for DataManager. Providers import from here instead
// of from globals.ts to keep the module graph acyclic.
let ref: DataManager | undefined

export function setDataManagerRef(dm: DataManager): void {
  ref = dm
}

export function getDataManagerRef(caller?: string): DataManager {
  if (!ref)
    throw new Error(
      caller
        ? `DataManager not initialized (called from ${caller})`
        : 'DataManager not initialized',
    )
  return ref
}
