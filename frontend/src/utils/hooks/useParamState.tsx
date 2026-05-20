import { useAtomValue, useSetAtom } from 'jotai'
import { locationAtom, urlParamAtom } from '../sharedSettingsState'

export function useParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType,
): [ParamStateType, (newValue: ParamStateType) => void] {
  // Fine-grained subscription: only re-renders when THIS param changes.
  const paramValue = useAtomValue(urlParamAtom(paramKey))
  // Setter only — does not subscribe to locationAtom value.
  const setLocationState = useSetAtom(locationAtom)

  const paramState = (paramValue ?? paramDefaultValue ?? '') as ParamStateType

  function setParamState(newValue: ParamStateType): void {
    setLocationState((prev) => {
      // Read window.location.search (not prev.searchParams) as the base so
      // params written via history.replaceState by the MadLib machinery are
      // included — jotai-location only re-syncs on popstate, not replaceState.
      const currentParams = new URLSearchParams(window.location.search)
      const originalString = currentParams.toString()

      if (newValue == null || newValue === false || newValue === '') {
        currentParams.delete(paramKey)
      } else {
        currentParams.set(paramKey, newValue as string)
      }

      if (originalString === currentParams.toString()) {
        return prev
      }
      return { ...prev, searchParams: currentParams }
    })
  }

  return [paramState, setParamState]
}
