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

    newValue
      ? currentParams.set(paramKey, newValue as string)
      : currentParams.delete(paramKey)

    const paramsHaveChanged =
      new URLSearchParams(window.location.search).toString() !==
      currentParams.toString()

    paramsHaveChanged &&
      setLocationState((prev) => ({ ...prev, searchParams: currentParams }))
  }

  return [paramState, setParamState]
}
