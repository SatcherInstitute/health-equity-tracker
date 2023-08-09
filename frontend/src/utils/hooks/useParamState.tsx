import { locationAtom } from '../sharedSettingsState'
import { useAtom } from 'jotai'

export function useParamState<ParamStateType>(
  paramKey: string,
  paramDefaultValue: ParamStateType
): [ParamStateType, (newValue: ParamStateType) => void] {
  const [location, setLocation] = useAtom(locationAtom)

  const paramState = location.searchParams?.get(paramKey) ?? paramDefaultValue

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
