#! /usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import chalk from "chalk"
import ora from "ora"
import { isGitInstalled, shallowClone } from "./git"
import { checkAndMapArgs, printError, StartMeUpArgs } from "./helper"
import execa from 'execa'

main()

async function main () {
  // REMOVE BEFORE FLIGHT
  const mockArgs = ['npx', 'startmeup']
  const cmdLineArgs = mockArgs
  // REMOVE BEFORE FLIGHT

  printUsage()
  
  // const cmdLineArgs = process.argv
  // checkEmptyArgs(cmdLineArgs)
  // await checkGit()
  // const args = mapArgs(cmdLineArgs)

  // // Prepare git clone
  // const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'startmeup-'))
  // console.log(tmpDir)
  // await doShallowClone(args.gitHttpsUrl, tmpDir)
  
  // // Copy the files they wanted into local directory
  // const { repoSubfolder, localFolder } = args
  // await execa(`cp -r ${path.join(tmpDir, repoSubfolder)} ${path.join(process.cwd(), localFolder)}`)

  // TODO: Make sure the .git files are not copied!
  // TODO: Make sure the copy command even works :)
  // TODO: Make sure this CLI is not such a goddamn mess! Time to clean it up! :)
  /**
   * Build startmeup in two ways:
   * 1) SLOW: $npx startmeup github.com/aGuyNamedJonas/cdk-stack-starter
   *    - Clones the >entire< repo to get you started
   * 
   * 2) FAST: $npx startmeup github.com/aGuyNamedJonas/cdk-stack-starter
   *    - Github action that we provide creates a "startmeup.bundle.zip" (can be configure through glob patterns)
   *    - startmeup checks for startmeup.bundle.zip
   *    - Just downloads that file to temp folder & unpacks it
   */
}

// function checkEmptyArgs (argsv: string[]) {
//   if (argsv.length === 2) {
//     printUsage()
//     process.exit(0)
//   }
// }

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



// Refactored part :)

function printUsage () {
  console.log('')
  console.log(chalk.bold('Quickly download any github repo folder to jumpstart coding'))
  console.log('')
  console.log('Usage:')
  console.log('$ npx startmeup repo[:branch] [repoSubfolder] [localFolder]')
  console.log('')
  console.log('Options:')
  console.log('repo\t\tRepository to download from - has to be one of:')
  console.log('\t\tgithub.com/<user>/<repo>')
  console.log('\t\tgitlab.com/<user>/<repo>')
  console.log('\t\tbitbucket.org/<user>/<repo>')
  console.log('\t\thttps://<path to repo>.git')
  console.log('\t\thttps://<path to bundle>/startmeup.bundle.zip')
  console.log('branch\t\t(Optional) Branch to use (default: main)')
  console.log('repoSubfolder\t(Optional) Repository subfolder (default: .)')
  console.log('localFolder\t(Optional) Local folder to download to (default: CWD)')
  console.log('')
  console.log(chalk.cyan('Got bug, issue, PR, feedback?'))
  console.log('https://github.com/aGuyNamedJonas/startmeup/CONTRIBUTING.md')
  console.log('')
}