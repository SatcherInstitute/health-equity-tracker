import type { Signal } from 'vega'
import type { MetricId } from '../../data/config/MetricConfig'
import { Y_STEP } from './constants'

function getSignals() {
  const yStepSignal: Signal = {
    name: 'y_step',
    value: Y_STEP,
  }
  const heightSignal: Signal = {
    name: 'height',
    update: "bandspace(domain('y').length, 0.1, 0.05) * y_step",
  }

  const signal = [yStepSignal, heightSignal]

  return signal
}

function maxValueInField(
  data: Array<Readonly<Record<string, any>>>,
  field: MetricId,
) {
  return Math.max(
    ...data
      .map((row) => row[field])
      .filter((value: number | undefined) => value !== undefined),
  )
}

function getLargerMeasure(
  data: Array<Readonly<Record<string, any>>>,
  lightMetricId: MetricId,
  darkMetricId: MetricId,
) {
  const lightValue = maxValueInField(data, lightMetricId)
  const darkValue = maxValueInField(data, darkMetricId)

  if (lightValue > darkValue) {
    return lightMetricId
  } else return darkMetricId
}

export { getSignals, maxValueInField, getLargerMeasure }
