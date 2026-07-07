import { useAtomValue, useSetAtom } from 'jotai'
import { locationAtom, urlParamAtom } from '../sharedSettingsState'

export function useParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType,
): [ParamStateType, (newValue: ParamStateType) => void] {
  const paramValue = useAtomValue(urlParamAtom(paramKey))
  const setLocationState = useSetAtom(locationAtom)

  const paramState = (paramValue ?? paramDefaultValue ?? '') as ParamStateType

  function setParamState(newValue: ParamStateType): void {
    // Guard outside the setter: jotai-location always calls applyLocation
    // (pushState) even when the updater returns prev unchanged.
    const currentValue = paramValue ?? ''
    const nextValue =
      newValue == null || newValue === false || newValue === ''
        ? ''
        : String(newValue)
    if (currentValue === nextValue) return

    setLocationState((prev) => {
      const params = new URLSearchParams(prev.searchParams)
      if (newValue == null || newValue === false || newValue === '') {
        params.delete(paramKey)
      } else {
        params.set(paramKey, nextValue)
      }
      return { ...prev, searchParams: params }
    })
  }

  return [paramState, setParamState]
}
