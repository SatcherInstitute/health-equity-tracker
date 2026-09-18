import type DataManager from './DataManager'

// Holds the DataManager singleton without importing DataManager itself at
// runtime, so providers can call getDataManager() without creating a cycle:
// providers → UniversalProvider → globals → DataManager → VariableProviderMap → providers
let ref: DataManager | undefined

export function setDataManagerRef(dm: DataManager): void {
  ref = dm
}

export function getDataManagerRef(): DataManager {
  if (!ref) throw new Error('DataManager not initialized')
  return ref
}
