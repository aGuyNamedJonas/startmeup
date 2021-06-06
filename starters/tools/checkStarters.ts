import { promises as fs } from 'fs'
import * as path from 'path'
import * as glob from 'glob'
const assert = require('assert')
const fetch = require('node-fetch')
const chalk = require('chalk')

main()

async function main () {
  const starterFilePaths = getAllStarterFiles()
  let starterFileValidation = []
  try {
    starterFileValidation = await Promise.all(starterFilePaths.map(starterFilePath => getStarterFileError(starterFilePath)))
  } catch (error) {
    console.log('Error while trying to validate starter json files: ' + error.toString())
    process.exit(1)
  }
  
  let errorCount = 0
  starterFileValidation.forEach(({ starter, isValid, errors = [] }) => {
    if (isValid) {
      console.log(starter, chalk.green('PASS'))
    } else {
      errorCount += 1
      console.log(starter, chalk.red('FAILED'))
      errors.forEach(error => console.log('\t', chalk.red(error)))
    }
  })

  console.log(`\nRan validation with ${errorCount === 0 ? chalk.green('0') : chalk.red(errorCount)} error(s)\n`)

  if (errorCount > 0) {
    process.exit(1)
  }

  process.exit(0)
}

function getAllStarterFiles () {
  const starterFiles = glob.sync('./starters/*.json')
  const absStarterFiles = starterFiles.map(starterFile => path.join(process.cwd(), starterFile))
  return absStarterFiles
}

async function getStarterFileError (starterFilePath: string) {
  const starter = path.basename(starterFilePath)
  let errors = []

  const starterFileRaw = await fs.readFile(starterFilePath, 'utf-8')
  const { bundleUrl, repo, description, category } = JSON.parse(starterFileRaw)

  if (!starter.match(/^([a-z0-9]+-)*[a-z0-9]+.json$/g)) {
    errors.push('"starter" file names can only include lowercase letters, numbers and dashes ("-") and need to satisfy the regex /^([a-z0-9]+-)*[a-z0-9]+.json$/g (similar to npm package names)')
  }

  if (bundleUrl.trim() === '') {
    errors.push('"bundleUrl" cannot be empty')
  }

  if (repo.trim() === '') {
    errors.push('"repo" cannot be empty')
  }

  if (description.trim() === '') {
    errors.push('"description" cannot be empty')
  }

  if (category.trim() === '') {
    errors.push('"category" cannot be empty')
  }

  if (
    !repo.startsWith('https://github.com') &&
    !repo.startsWith('https://gitlab.com') &&
    !repo.startsWith('https://bitbucket.org')
  ) {
    errors.push('"repo" has to be a github.com, gitlab.com or bitbucket.org HTTPS URL')
  } else {
    // Check that bundleUrl & repo are pointing to the same thing
    // "bundleUrl": "https://raw.githubusercontent.com/aGuyNamedJonas/cdk-stack-starter/main/startmeup.bundle.zip",
    // "repo": "https://github.com/aGuyNamedJonas/cdk-stack-starter",
    const [https, repoUrl] = repo.split('https://')
    const [platform, user, repository, ...rest] = repoUrl.split('/')
    
    if (
      !bundleUrl.startsWith(`https://raw.githubusercontent.com/${user}/${repository}`) &&
      !bundleUrl.startsWith(`https://gitlab.com/${user}/${repository}`) &&
      !bundleUrl.startsWith(`'https://bitbucket.org/${user}/${repository}`)
    ) {
      errors.push('"bundleUrl" needs to be in the same repository as you point to in "repo"')
    }
  }

  if (!bundleUrl.endsWith('startmeup.bundle.zip')) {
    errors.push('"bundleUrl" needs to point to a startmeup.bundle.zip file')
  }

  const bundleUrlHeadRequest = await fetch(bundleUrl, {
    method: 'HEAD'
  })
  
  if (!bundleUrlHeadRequest.ok) {
    errors.push(`HEAD request to ${bundleUrl} failed (does not exist)`)
  }

  return errors.length > 0
    ? { starter, isValid: false, errors }
    : { starter, isValid: true }
}