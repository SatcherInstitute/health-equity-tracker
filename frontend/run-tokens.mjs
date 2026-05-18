#!/usr/bin/env node
// Runs the Terrazzo token build without @terrazzo/cli (avoids Rolldown/Vite
// peer-dep chain). Uses @terrazzo/parser directly with our config's plugins.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))

/**
 * Load and flatten DTCG token JSON files into a flat id→token record.
 * Inherits $type from the parent group when the individual token omits it.
 * @param {string[]} paths
 * @returns {Promise<Record<string, { id: string, $type: string, $value: unknown }>>}
 */
async function loadTokens(paths) {
  /** @type {Record<string, { id: string, $type: string, $value: unknown }>} */
  const tokens = {}
  for (const p of paths) {
    const data = JSON.parse(await readFile(resolve(__dir, p), 'utf8'))
    flatten(data, '', null, tokens)
  }
  return tokens
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} prefix
 * @param {string | null} inheritedType
 * @param {Record<string, unknown>} acc
 */
function flatten(obj, prefix, inheritedType, acc) {
  const groupType = /** @type {string|null} */ (obj.$type ?? inheritedType)
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue
    const id = prefix ? `${prefix}.${key}` : key
    if (val && typeof val === 'object' && '$value' in val) {
      acc[id] = { id, $type: val.$type ?? groupType ?? 'string', $value: val.$value }
    } else if (val && typeof val === 'object') {
      flatten(/** @type {any} */ (val), id, groupType, acc)
    }
  }
}

const { default: config } = await import('./terrazzo.config.mjs')
const tokens = await loadTokens(config.tokens)

/** @type {Record<string, string>} */
const outputFiles = {}

for (const plugin of config.plugins) {
  if (typeof plugin.build === 'function') {
    await plugin.build({
      tokens,
      /** @param {string} filename @param {string} contents */
      outputFile(filename, contents) {
        outputFiles[filename] = contents
      },
    })
  }
}

const outDir = resolve(__dir, config.outDir)
await mkdir(outDir, { recursive: true })
for (const [filename, contents] of Object.entries(outputFiles)) {
  await writeFile(resolve(outDir, filename), contents, 'utf8')
}

console.log(`✔  ${Object.keys(tokens).length} tokens built → ${Object.keys(outputFiles).length} files`)
