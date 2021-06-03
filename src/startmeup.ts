import * as path from 'path'
import chalk from "chalk"
import { ArgTypes, GitArgs, StarterArgs } from "./lib"

export async function startmeup (props: StartmeupProps) {
  const args = props.argsParser(props.argsv)

  if (args.empty) {
    props.printUsage()
    return
  }

  if (args.type === ArgTypes.GIT) {
    await runGitVariant(props, args)
  } else {
    await runStarterVariant(props, args)
  }
}

export type StartmeupProps = {
  argsv: string[],
  argsParser: (argsv: string[]) => GitArgs | StarterArgs,
  fetcher: (url: string, targetFolder: string, progressCb?: (progress: number) => void) => Promise<void>,
  git: (gitCmd: string) => Promise<void>,
  tempDirCreator: () => string,
  fileCopier: (sourceFolder: string, targetFolder: string) => Promise<void>,
  fileDestroyer: (targetFile: string) => void,
  unzip: (sourceFile: string, targetFolder: string) => Promise<void>,
  printUsage: () => void,
}

async function runGitVariant (props: StartmeupProps, args: GitArgs) {
  const {
    argsv,
    argsParser,
    fetcher,
    git,
    tempDirCreator,
    fileCopier,
    fileDestroyer,
    unzip,
    printUsage,
  } = props
  const tempDir = tempDirCreator()

  let bundleLocalPath
  if (args.possibleBundleUrl) {
    try {
      await fetcher(args.possibleBundleUrl, tempDir)
      bundleLocalPath = path.join(tempDir, 'startmeup.bundle.zip')
    } catch (error) {
      bundleLocalPath = ''
    }
  } else {
    bundleLocalPath = ''
  }

  if (!bundleLocalPath) {
    try {
      await git('version')
    } catch (error) {
      throw new Error('Requires git to run')
    }

    await git(`clone --depth=1 ${args.gitUrl} ${tempDir}`)
    await fileCopier(
      path.join(tempDir, args.repoFolder),
      args.localFolder,
    )

    fileDestroyer(tempDir)

    return
  }

  // unbox local bundle
  await unzip(bundleLocalPath, tempDir)
  await fileDestroyer(bundleLocalPath)
  await fileCopier(tempDir, args.localFolder)
  await fileDestroyer(tempDir)
}

async function runStarterVariant (props: StartmeupProps, args: StarterArgs) {

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
  console.log('$ npx startmeup starter [localFolder]')
  console.log('')
  console.log('Options:')
  console.log('repo\t\tRepository to download from - has to be one of:')
  console.log('\t\tgithub.com/<user>/<repo>')
  console.log('\t\tgitlab.com/<user>/<repo>')
  console.log('\t\tbitbucket.org/<user>/<repo>')
  console.log('\t\thttps://<path to repo>.git')
  console.log('starter\t\tStarter name of registered starter')
  console.log('branch\t\t(Optional) Branch to use (default: main)')
  console.log('repoSubfolder\t(Optional) Repository subfolder (default: .)')
  console.log('localFolder\t(Optional) Local folder to download to (default: CWD)')
  console.log('')
  console.log(chalk.cyan('Got bug, issue, PR, feedback?'))
  console.log('https://github.com/aGuyNamedJonas/startmeup/CONTRIBUTING.md')
  console.log('')
}

/**
 * __FUTURE__IMPROVEMENT__IDEA__
 * (Optional) startmeup.config.json:
 * {
 *   "run-install": true, // Runs npm install / yarn install after package is downloaded
 *   "dependencies": {},  // Node dependencies to add (in case this is a partial starter meant for existing node.js projects)
 *   "dev-dependencies": {}  // Node dev-dependencies to add (in case this is a partial starter meant for existing node.js projects)
 * }
 */