import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FeatureCollection, Position } from 'geojson'
import { feature, merge } from 'topojson-client'
import { describe, expect, test } from 'vitest'

// Verifies the generated split files (npm run geo) decode to features
// identical to those decoded from the full source topology.

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dir, '../../src/assets/geo')

const source = JSON.parse(
  readFileSync(resolve(__dir, 'geographies.json'), 'utf8'),
)
const statesTopo = JSON.parse(
  readFileSync(resolve(OUT_DIR, 'geographies_states.json'), 'utf8'),
)

const countiesByState = new Map<string, any[]>()
for (const g of source.objects.counties.geometries) {
  const stateFips = String(g.id).slice(0, 2)
  const group = countiesByState.get(stateFips)
  group ? group.push(g) : countiesByState.set(stateFips, [g])
}

function readCountiesFile(stateFips: string) {
  return JSON.parse(
    readFileSync(
      resolve(OUT_DIR, `geographies_counties-${stateFips}.json`),
      'utf8',
    ),
  )
}

function bbox(featureCollection: FeatureCollection): number[] {
  const box = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ]
  const visit = (coords: Position | Position[] | Position[][]) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords as Position
      box[0] = Math.min(box[0], x)
      box[1] = Math.min(box[1], y)
      box[2] = Math.max(box[2], x)
      box[3] = Math.max(box[3], y)
    } else {
      for (const c of coords as Position[]) visit(c)
    }
  }
  for (const f of featureCollection.features) {
    visit((f.geometry as any).coordinates)
  }
  return box.map((v) => Number(v.toFixed(6)))
}

describe('split geographies files', () => {
  test('states file decodes identically to the full topology', () => {
    const fromSource = feature(source, source.objects.states)
    const fromSplit = feature(statesTopo, statesTopo.objects.states)
    expect(JSON.stringify(fromSplit)).toEqual(JSON.stringify(fromSource))
  })

  test('every county file decodes identically to the full topology', () => {
    for (const [stateFips, geometries] of countiesByState) {
      const split = readCountiesFile(stateFips)
      const fromSource = feature(source, {
        type: 'GeometryCollection',
        geometries,
      } as any)
      const fromSplit = feature(split, split.objects.counties)
      expect(JSON.stringify(fromSplit), `state ${stateFips}`).toEqual(
        JSON.stringify(fromSource),
      )
    }
  })

  test('county files cover every county exactly once', () => {
    const sourceIds = source.objects.counties.geometries
      .map((g: any) => String(g.id))
      .sort()
    const splitIds = [...countiesByState.keys()]
      .flatMap((stateFips) =>
        readCountiesFile(stateFips).objects.counties.geometries.map((g: any) =>
          String(g.id),
        ),
      )
      .sort()
    expect(splitIds).toEqual(sourceIds)
  })

  test('merged county outlines match the source state shapes', () => {
    // A state, the district, and a territory
    for (const stateFips of ['13', '11', '72']) {
      const split = readCountiesFile(stateFips)
      const merged: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: stateFips,
            properties: {},
            geometry: merge(split, split.objects.counties.geometries),
          },
        ],
      }
      const fromStatesObject = feature(source, source.objects.states) as any
      const stateFeature: FeatureCollection = {
        type: 'FeatureCollection',
        features: fromStatesObject.features.filter(
          (f: any) => String(f.id) === stateFips,
        ),
      }
      expect(bbox(merged), `state ${stateFips}`).toEqual(bbox(stateFeature))
    }
  })
})
