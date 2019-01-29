import { Command } from 'commander'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import * as yaml from 'js-yaml'
import { Locale } from './index.d'
import { buildModelForLocale } from './build-model'

const program = new Command('alexa-language-model-generator')

program
  .version('0.0.1')
  .option(
    '-i, --invocation [path]',
    'Invocation name file path (default invocation.yml)',
    'invocation.yml'
  )
  .option(
    '-l, --locales [locales]',
    'Specific Locales seperated by comma (default all)',
    'de-DE,en-AU,en-CA,en-GB,en-IN,en-US,es-ES,es-MX,fr-FR,ja-JP'
  )
  .option(
    '-n, --intents [path]',
    'Intent file path where all intents are defined (default intents.yml)',
    'intents.yml'
  )
  .option(
    '-t, --types [path]',
    'Intent file path where all types are defined (default types.yml)',
    'types.yml'
  )
  .option(
    '-m, --models [path]',
    'Path to the folder where model json files should be stored (default model)',
    'models'
  )
  .parse(process.argv)

const { invocation, locales, intents, types, models } = program
if (!existsSync(models)) {
  mkdirSync(models)
}
if (!existsSync(invocation)) {
  console.error('Invocation Name file path is required. Use -i to add invocation file path')
  process.exit(1)
}
locales.split(',').map((locale: Locale) => {
  if (!existsSync(intents)) {
    console.error('You need to create an intents.yaml file')
    process.exit(1)
  }
  const invocationJson = yaml.safeLoad(readFileSync(intents, 'utf8'))
  const intentsJson = yaml.safeLoad(readFileSync(intents, 'utf8'))
  let typesJson = {}
  if (!existsSync(types)) {
    console.warn('No types.yaml file')
  } else {
    typesJson = yaml.safeLoad(readFileSync(types, 'utf8'))
  }
  const im = buildModelForLocale(invocation.toLowerCase(), locale, intentsJson, typesJson)
  try {
    writeFileSync(resolve(models, locale + '.json'), JSON.stringify(im), 'utf8')
  } catch (error) {
    console.log(`Unable to write model ${error}`)
  }
})
