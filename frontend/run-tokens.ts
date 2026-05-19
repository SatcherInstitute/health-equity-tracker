#!/usr/bin/env tsx
// Token build runner — uses @terrazzo/parser directly.
// @terrazzo/cli requires vite@8 which conflicts with the project's vite@6,
// causing a bundled-dep lock file conflict on npm ci (see Vite upgrade PR).
// This runner avoids that by not depending on vite-node at all.
// TODO: remove this file and switch to `tz build` after Vite 8 upgrade.
import { build, parse } from '@terrazzo/parser'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import config from './terrazzo.config.ts'

const __dir = dirname(fileURLToPath(import.meta.url))
const outDirUrl = pathToFileURL(resolve(__dir, config.outDir) + '/')

const sources = await Promise.all(
  config.tokens.map(async (tokenPath) => ({
    src: JSON.parse(await readFile(resolve(__dir, tokenPath), 'utf8')),
    filename: pathToFileURL(resolve(__dir, tokenPath)),
  })),
)

const { tokens, resolver } = await parse(sources, {
  config: { ...config, outDir: outDirUrl },
})

const { outputFiles } = await build(tokens, {
  resolver,
  sources,
  config: { ...config, outDir: outDirUrl },
})

await mkdir(fileURLToPath(outDirUrl), { recursive: true })
for (const { filename, contents } of outputFiles) {
  await writeFile(fileURLToPath(new URL(filename, outDirUrl)), contents, 'utf8')
}

console.log(`✔  ${Object.keys(tokens).length} tokens built → ${outputFiles.length} files`)
