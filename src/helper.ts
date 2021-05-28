import chalk from "chalk"
import { GIT_PLATFORM } from "./git"

export type StartMeUpArgs = {
  repo: string,
  gitHttpsUrl: string,
  gitPlatform: GIT_PLATFORM,
  repoSubfolder: string,
  localFolder: string,
}

export function checkAndMapArgs (args: string[]): StartMeUpArgs {
  const [npx, startmeup, repo, optRepoSubfolder, optLocalFolder] = args
  let startmeUpArgs = {
    repo,
    gitHttpsUrl: `https://${repo}.git`,
    gitPlatform: GIT_PLATFORM.GITHUB,
    repoSubfolder: optRepoSubfolder || '.',
    localFolder: optLocalFolder || './test',
  }

  if (!repo.trim().startsWith('github.com') || repo.trim().endsWith('.git')) {
    throw new Error('repo invalid - needs to be github.com/<user>/<repo>')
  }

  return startmeUpArgs
}

export function printError(error: Error) {
  console.log('')
  console.log(chalk.red(error.toString()))
  console.log(chalk.cyan('Run $ npx startmeup for usage'))
  console.log('')
}

export function printUsage () {
  console.log('')
  console.log(chalk.bold('Quickly download any github repo folder to jumpstart coding'))
  console.log('')
  console.log('Usage:')
  console.log('$ npx startmeup repo[:branch] [repoSubfolder] [localFolder]')
  console.log('')
  console.log('Options:')
  console.log('repo\t\tNeeds to be github.com/<user>/<subfolder>')
  console.log('branch\t\t(Optional) Branch to use (default: main)')
  console.log('repoSubfolder\t(Optional) Repository subfolder (default: Entire repo)')
  console.log('localFolder\t(Optional) Local folder to download to (default: CWD)')
  console.log('')
  console.log(chalk.cyan('Missing support for Gitlab / Bitbucket?'))
  console.log('Submit your PR:')
  console.log('https://github.com/aGuyNamedJonas/startmeup')
  console.log('')
}

/**
 * (Optional) startmeup.config.json:
 * {
 *   "npm-install": true, // Runs npm install / yarn install after package is downloaded
 *   "dependencies": {},  // Node dependencies to add (in case this is a partial starter meant for existing node.js projects)
 *   "dev-dependencies": {}  // Node dev-dependencies to add (in case this is a partial starter meant for existing node.js projects)
 * }
 */