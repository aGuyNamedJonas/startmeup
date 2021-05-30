import * as path from 'path'
import urljoin from 'url-join'

type StartmeupArgs = {
  empty?: boolean,
  isStarter?: boolean,
  starter?: string,
  starterSubfolder?: string,
  gitUrl: string,
  branch: string,
  possibleBundleUrl: string,
  repoFolder: string,
  localFolder: string,
}

export function parseArgs (argsv: string[]): StartmeupArgs {
  if (argsv.length === 2) {
    return { empty: true } as StartmeupArgs
  }

  const [npx, startmeup, repo, repoFolderParam, localFolderParam] = argsv

  let gitUrl = ''
  if (
      repo.startsWith('github.com') ||
      repo.startsWith('gitlab.com') ||
      repo.startsWith('bitbucket.org')
    ) {
    gitUrl = `https://${repo}.git`
  } else if (
    repo.startsWith('https://') &&
    (repo.endsWith('.git') || repo.endsWith('startmeup.bundle.zip'))
  ) {
    gitUrl = repo
  } else {
    throw new Error('repo invalid')
  }

  const customBranchMatcher = /:(\w+)$/g
  const customBranch = customBranchMatcher.exec(repo)
  const branch = customBranch ? customBranch[1] : 'main'

  // Guess startmeup.bundle.zip file location
  let possibleBundleUrl = ''
  const [provider, userName, repoNameWithOptionalBranch] = repo.split('/')
  const repoName = repoNameWithOptionalBranch.split(':')[0]

  if (repo.startsWith('https://') && repo.endsWith('startmeup.bundle.zip')) {
    possibleBundleUrl = repo
  } else if (repo.startsWith('github.com')) {
    possibleBundleUrl = urljoin(
      'https://raw.githubusercontent.com',
      userName,
      repoName,
      branch,
      repoFolderParam || '',
      'startmeup.bundle.zip',
    )
  } else if (repo.startsWith('gitlab.com')) {
    possibleBundleUrl = urljoin(
      'https://gitlab.com',
      userName,
      repoName,
      '/-/raw',
      branch,
      repoFolderParam || '',
      'startmeup.bundle.zip',
      '?inline=false',
    )
  } else if (repo.startsWith('bitbucket.org')) {
    possibleBundleUrl = urljoin(
      'https://bitbucket.org',
      userName,
      repoName,
      '/raw',
      branch,
      repoFolderParam || '',
      'startmeup.bundle.zip',
    )
  }

  const repoFolder = repoFolderParam || '.'
  const localFolderRaw = localFolderParam || '.'
  const localFolder = path.join(process.cwd(), localFolderRaw)

  return {
    gitUrl,
    branch,
    possibleBundleUrl,
    repoFolder,
    localFolder,
  } as StartmeupArgs
}