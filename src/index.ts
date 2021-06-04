#! /usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import ora from "ora"
import execa from 'execa'
import { argsParser } from './lib'
import { printError, printUsage, startmeup } from './startmeup'
import { fetcher, fileDestroyer, fileReader, fileCopier, tempDirCreator, git, unzip } from './helper'

main()

async function main () {
  // TODO: Add progressCb
  const argsv = process.argv

  try {
    await startmeup({
      argsv,
      argsParser,
      fetcher,
      git,
      tempDirCreator,
      fileCopier,
      fileDestroyer,
      fileReader,
      unzip,
      printUsage,
    })
    process.exit(0)
  } catch (error) {
    printError(error)
    process.exit(1)
  }
}