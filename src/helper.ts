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
    localFolder: optLocalFolder || process.cwd(),
  }

  if (!repo.trim().startsWith('github.com') || repo.trim().endsWith('.git')) {
    throw new Error('repo invalid - needs to be github.com/<user>/<repo>')
  }

  return startmeUpArgs
}

export function printError(error: Error) {
  console.log(chalk.red(error.toString()))
  console.log(chalk.cyan('Run $ npx startmeup for usage'))
  console.log('')
}

export function printUsage () {
  console.log('')
  console.log(chalk.bold('Quickly download any github repo folder to jumpstart coding'))
  console.log('')
  console.log('Usage:')
  console.log('$ npx startmeup repo [repoSubfolder] [localFolder]')
  console.log('')
  console.log('Options:')
  console.log('gitUrl\t\tNeeds to be github.com/<user>/<subfolder>')
  console.log('gitSubfolder\t(Optional) Repository subfolder (default: Entire repo)')
  console.log('localFolder\t(Optional) Local folder to download to (default: CWD)')
  console.log('')
  console.log(chalk.cyan('Missing support for Gitlab / Bitbucket?'))
  console.log('Submit your PR:')
  console.log('https://github.com/aGuyNamedJonas/startmeup')
  console.log('')
}