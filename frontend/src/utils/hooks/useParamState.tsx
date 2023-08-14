import { locationAtom } from '../sharedSettingsState'
import { useAtom, useAtomValue } from 'jotai'

export function useParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType
): [ParamStateType, (newValue: ParamStateType) => void] {
  const [locationState, setLocationState] = useAtom(locationAtom)

  const paramState =
    locationState.searchParams?.get(paramKey) ?? paramDefaultValue ?? ''

  function setParamState(newValue: ParamStateType): void {
    const existingURLParams = new URLSearchParams(document.location.search)

    const existingLocationStateParams = new URLSearchParams(
      locationState.searchParams
    )

    const combinedParams = new URLSearchParams({
      ...Object.fromEntries(existingURLParams),
      ...Object.fromEntries(existingLocationStateParams),
    })

    newValue
      ? combinedParams.set(paramKey, newValue as string)
      : combinedParams.delete(paramKey)

    setLocationState((prev) => ({
      ...prev,
      searchParams: combinedParams,
    }))
  }

  return [paramState as ParamStateType, setParamState]
}

export function useGetParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType
): ParamStateType {
  const locationState = useAtomValue(locationAtom)
  const paramState =
    locationState.searchParams?.get(paramKey) ?? paramDefaultValue ?? ''
  return paramState as ParamStateType
}
