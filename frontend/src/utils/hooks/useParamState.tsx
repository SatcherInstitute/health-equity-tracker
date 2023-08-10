import { locationAtom } from '../sharedSettingsState'
import { useAtom, useAtomValue } from 'jotai'

export function useParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType
): [ParamStateType, (newValue: ParamStateType) => void] {
  const [location, setLocation] = useAtom(locationAtom)

  const paramState =
    location.searchParams?.get(paramKey) ?? paramDefaultValue ?? ''

  function setParamState(newValue: ParamStateType): void {
    newValue
      ? location.searchParams?.set(paramKey, newValue as string)
      : location.searchParams?.delete(paramKey)

    setLocation((prev) => ({
      ...prev,
      searchParams: location.searchParams,
    }))
  }

  return [paramState as ParamStateType, setParamState]
}

export function useGetParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue?: ParamStateType
): ParamStateType {
  const location = useAtomValue(locationAtom)
  const paramState =
    location.searchParams?.get(paramKey) ?? paramDefaultValue ?? ''
  return paramState as ParamStateType
}
