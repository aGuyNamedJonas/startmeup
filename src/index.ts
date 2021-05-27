#! /usr/bin/env node

import chalk from "chalk"
import ora from "ora"
import { isGitInstalled } from "./git"
import { checkAndMapArgs, printError, printUsage, StartMeUpArgs } from "./helper"

main()

async function main () {
  // REMOVE BEFORE FLIGHT
  const mockArgs = ['npx', 'startmeup']
  // REMOVE BEFORE FLIGHT
  const cmdLineArgs = process.argv

  checkEmptyArgs(cmdLineArgs)
  printUsage()

  // const args = mapArgs(process.argv)
  const args = mapArgs(mockArgs)
  await checkGit()
}

function checkEmptyArgs (argsv: string[]) {
  if (argsv.length === 2) {
    printUsage()
    process.exit(0)
  }
}

function mapArgs (argsv: string[]) {
  let args: StartMeUpArgs
  try {
    args = checkAndMapArgs(argsv)
  } catch (error) {
    printError(error)
    process.exit(1)
  }

  return args
}

async function checkGit () {
  const spinner = ora('Checking if git is installed').start()

  const gitInstalled = await isGitInstalled()
  if (gitInstalled) {
    spinner.succeed()
  } else {
    spinner.fail()
    process.exit(1)
  }
}

