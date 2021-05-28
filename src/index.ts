#! /usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import chalk from "chalk"
import ora from "ora"
import { isGitInstalled, shallowClone } from "./git"
import { checkAndMapArgs, printError, printUsage, StartMeUpArgs } from "./helper"
import execa from 'execa'

main()

async function main () {
  // REMOVE BEFORE FLIGHT
  const mockArgs = ['npx', 'startmeup', 'github.com/facebook/react']
  const cmdLineArgs = mockArgs
  // REMOVE BEFORE FLIGHT
  
  // const cmdLineArgs = process.argv
  checkEmptyArgs(cmdLineArgs)
  await checkGit()
  const args = mapArgs(cmdLineArgs)

  // Prepare git clone
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'startmeup-'))
  console.log(tmpDir)
  await doShallowClone(args.gitHttpsUrl, tmpDir)
  
  // Copy the files they wanted into local directory
  const { repoSubfolder, localFolder } = args
  await execa(`cp -r ${path.join(tmpDir, repoSubfolder)} ${path.join(process.cwd(), localFolder)}`)

  // TODO: Make sure the .git files are not copied!
  // TODO: Make sure the copy command even works :)
  // TODO: Make sure this CLI is not such a goddamn mess! Time to clean it up! :)
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
  // const spinner = ora('Checking if git is installed').start()
  // spinner.succeed()
  // spinner.fail()

  const gitInstalled = await isGitInstalled()
  if (!gitInstalled) {
    printError(new Error('Requires git to be installed'))
    process.exit(1)
  }
}

async function doShallowClone (gitHttpsUrl: string, tmpDir: string) {
  const spinner = ora(`Shallow cloning ${gitHttpsUrl}`).start()

  try {
    await shallowClone(gitHttpsUrl, tmpDir)
  } catch (error) {
    spinner.fail()
    printError(error)
    process.exit(1)
  }

  spinner.succeed()
}