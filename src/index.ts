#! /usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as http from 'http'
import ora from "ora"
import execa from 'execa'
import { parseArgs } from './lib'
import { printError, printUsage, startmeup } from './startmeup'
import fsExtra from 'fs-extra'

const Downloader = require('nodejs-file-downloader')

main()

async function main () {
  // TODO: Add progressCb
  const argsv = process.argv
  const argsParser = parseArgs
  // const fetcher = 
  // const fetcher = async (url: string, targetFolder: string) => {
  //   const fileName = path.join(targetFolder, path.basename(url))
  //   const file = fs.createWriteStream(fileName);
  //   const request = http.get(url, function(response) {
  //     response.pipe(file);

  //   })
  // }
  const fetcher = async (url: string, targetFolder: string) => new Downloader({
    url,
    directory: targetFolder,
  }).download()
  const git = async (gitCmd: string) => await execa.command(`git ${gitCmd}`) as unknown as Promise<void>
  // const tempDirCreator = () => fs.mkdtempSync(path.join(os.tmpdir(), 'startmeup-'))
  const tempDirCreator = () => {
    const tempDir = path.join(process.cwd(), 'startmeup-temp')
    fs.mkdirSync(tempDir)
    return tempDir
  }

  // TODO: Remove .git files from being copied (try using fs-extra again!)
  const fileCopier = (sourceFolder: string, destinationFolder: string) => {
    execa.commandSync(`mkdir -p ${destinationFolder}`)
    execa.commandSync(`cp -R ${sourceFolder}/ ${destinationFolder} --exclude=.git`)
  }
  const fileDestroyer = (targetFile: string) => fs.rmdirSync(targetFile, { recursive: true })
  // const fileDestroyer = (targetFile: string) => console.log(`Dry run: Destroying ${targetFile}`)
  const unzip = (sourceFile: string, targetFolder: string) => Promise.resolve()

  try {
    await startmeup({
      argsv,
      argsParser,
      fetcher,
      git,
      tempDirCreator,
      fileCopier,
      fileDestroyer,
      unzip,
      printUsage,
    })
    process.exit(0)
  } catch (error) {
    printError(error)
    process.exit(1)
  }
}