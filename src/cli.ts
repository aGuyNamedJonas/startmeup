import chalk from "chalk"

export async function startmeup(
  gitDownloader: (gitUrl: string, tempDir: string) => Promise<void>,
  fetcher: (url: string, progressCb: (progress: number) => void) => Promise<void>,
  fileCopier: (src: string, dst: string) => void,
  fileDestroyer: (target: string) => void,
) {
  console.log('TODO: Implement ;)')
}

export function printUsage () {
  console.log('')
  console.log(chalk.bold('Quickly download any github repo folder to jumpstart coding'))
  console.log('')
  console.log('Usage:')
  console.log('$ npx startmeup repo[:branch] [repoSubfolder] [localFolder]')
  console.log('$ npx startmeup starter [localFolder]')
  console.log('')
  console.log('Options:')
  console.log('repo\t\tRepository to download from - has to be one of:')
  console.log('\t\tgithub.com/<user>/<repo>')
  console.log('\t\tgitlab.com/<user>/<repo>')
  console.log('\t\tbitbucket.org/<user>/<repo>')
  console.log('\t\thttps://<path to repo>.git')
  console.log('\t\thttps://<path to bundle>/startmeup.bundle.zip')
  console.log('starter\t\tStarter name of registered starter')
  console.log('branch\t\t(Optional) Branch to use (default: main)')
  console.log('repoSubfolder\t(Optional) Repository subfolder (default: .)')
  console.log('localFolder\t(Optional) Local folder to download to (default: CWD)')
  console.log('')
  console.log(chalk.cyan('Got bug, issue, PR, feedback?'))
  console.log('https://github.com/aGuyNamedJonas/startmeup/CONTRIBUTING.md')
  console.log('')
}