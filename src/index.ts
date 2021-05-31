#! /usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import ora from "ora"
import execa from 'execa'
import { argsParser } from './lib'
import { printError, printUsage, startmeup } from './startmeup'
import { fetcher, fileDestroyer, tempDirCreator, git } from './helper'

main()

async function main () {
  // TODO: Add progressCb
  const argsv = process.argv

  // TODO: Remove .git files from being copied (try using fs-extra again!)
  const fileCopier = (sourceFolder: string, destinationFolder: string) => {
    execa.commandSync(`mkdir -p ${destinationFolder}`)
    execa.commandSync(`cp -R ${sourceFolder}/ ${destinationFolder} --exclude=.git`)
  }
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