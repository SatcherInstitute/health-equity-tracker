import type { GeometryCollection, Topology } from 'topojson-specification'
import { describe, expect, test } from 'vitest'
import georgiaCounties from '../../assets/geo/geographies_counties-13.json'
import texasCounties from '../../assets/geo/geographies_counties-48.json'
import states from '../../assets/geo/geographies_states.json'
import { buildCoastalArcSet, getBorderingFips } from './topologyUtils'

const statesTopology = states as unknown as Topology
const georgiaTopology = georgiaCounties as unknown as Topology

describe('getBorderingFips', () => {
  test("Georgia's bordering states", () => {
    // AL, FL, NC, SC, TN
    expect(getBorderingFips(statesTopology, '13')).toEqual([
      '01',
      '12',
      '37',
      '45',
      '47',
    ])
  })

  test('a corner-only touch does not count as bordering', () => {
    // Colorado meets Arizona only at the Four Corners point
    expect(getBorderingFips(statesTopology, '08')).not.toContain('04')
    expect(getBorderingFips(statesTopology, '08')).toContain('49')
  })

  test('states without land borders have none', () => {
    for (const fips of ['02', '15', '72']) {
      expect(getBorderingFips(statesTopology, fips)).toEqual([])
    }
  })

  test("Fulton County's bordering counties", () => {
    // cSpell:ignore Fayette
    // Carroll, Cherokee, Clayton, Cobb, Coweta, DeKalb, Douglas, Fayette,
    // Forsyth, Gwinnett
    expect(getBorderingFips(georgiaTopology, '13121')).toEqual([
      '13045',
      '13057',
      '13063',
      '13067',
      '13077',
      '13089',
      '13097',
      '13113',
      '13117',
      '13135',
    ])
  })

  test('is symmetric across every county in a large state', () => {
    const texas = texasCounties as unknown as Topology
    const counties = (
      texas.objects.counties as { geometries: Array<{ id: string }> }
    ).geometries
    expect(counties).toHaveLength(254)
    for (const { id } of counties) {
      for (const neighbor of getBorderingFips(texas, id)) {
        expect(getBorderingFips(texas, neighbor)).toContain(id)
      }
    }
  })

  test('unknown places and mismatched topologies return []', () => {
    expect(getBorderingFips(georgiaTopology, '99999')).toEqual([])
    // A county code against the states topology has no counties object
    expect(getBorderingFips(statesTopology, '13121')).toEqual([])
  })
})

describe('buildCoastalArcSet', () => {
  const statesCollection = statesTopology.objects.states as GeometryCollection
  const coastal = buildCoastalArcSet(statesCollection)
  const arcsOf = (fips: string) => {
    const geometry = statesCollection.geometries.find((g) => g.id === fips)
    const arcs = (geometry as { arcs: number[][] | number[][][] }).arcs
    return arcs.flat(2).map((i) => (i < 0 ? ~i : i))
  }

  test('an island state is all coastline', () => {
    expect(arcsOf('15').every((arc) => coastal.has(arc))).toBe(true)
  })

  test('a landlocked state has no coastline', () => {
    expect(arcsOf('08').some((arc) => coastal.has(arc))).toBe(false)
  })
})
