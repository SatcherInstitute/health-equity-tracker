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
    const currentParams = new URLSearchParams(window.location.search)
    const originalString = currentParams.toString()

    newValue !== undefined && newValue !== null && newValue !== false
      ? currentParams.set(paramKey, newValue as string)
      : currentParams.delete(paramKey)

    if (originalString !== currentParams.toString()) {
      setLocationState((prev) => ({ ...prev, searchParams: currentParams }))
    }
  }

  return [paramState, setParamState]
}
