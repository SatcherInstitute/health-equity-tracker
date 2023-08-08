import { locationAtom } from '../sharedSettingsState'
import { useAtom } from 'jotai'

export function useParamState(
  paramKey: string
): [string, (newValue: string) => void] {
  const [location, setLocation] = useAtom(locationAtom)

  const paramState = location.searchParams?.get(paramKey) ?? ''

  function setParamState(newValue: string): void {
    newValue
      ? location.searchParams?.append(paramKey, newValue)
      : location.searchParams?.delete(paramKey)

    setLocation((prev) => ({
      ...prev,
      searchParams: location.searchParams,
    }))
  }

  return [paramState, setParamState]
}
