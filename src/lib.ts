import * as path from 'path'
import urljoin from 'url-join'

export function argsParser (argsv: string[]): GitArgs | StarterArgs {
  if (argsv.length === 2) {
    return { empty: true } as GitArgs
  }

  const [npx, startmeup, starterOrRepo] = argsv
  if (starterOrRepo.includes('/')) {
    return parseGitArgs(argsv)
  } else {
    return parseStarterArgs(argsv)
  }
}

export enum ArgTypes {
  GIT = 'GIT',
  STARTER = 'STARTER',
}

// Args for:
// $ npx startmeup repo[:branch] [repoSubfolder] [localFolder]
export type GitArgs = {
  empty: boolean,
  type: ArgTypes.GIT,
  gitUrl: string,
  branch: string,
  possibleBundleUrl: string,
  repoFolder: string,
  localFolder: string,
}

// Args for:
// $ npx startmeup starter [localFolder]
export type StarterArgs = {
  empty: boolean,
  type: ArgTypes.STARTER
  starter: string,
  localFolder: string,
  starterJsonUrl: string,
}

function parseGitArgs (argsv: string[]): GitArgs {
  const [npx, startmeup, repo, repoFolderParam, localFolderParam] = argsv

  const customBranchMatcher = /:(\w+)$/g
  const customBranch = customBranchMatcher.exec(repo)
  const branch = customBranch ? customBranch[1] : 'main'

  const [provider, userName, repoNameWithOptionalBranch] = repo.split('/')
  const repoName = repoNameWithOptionalBranch.split(':')[0]

  let gitUrl = ''
  if (
      repo.startsWith('github.com') ||
      repo.startsWith('gitlab.com') ||
      repo.startsWith('bitbucket.org')
    ) {
    gitUrl = `https://${provider}/${userName}/${repoName}.git`
  } else if (
    repo.startsWith('https://') &&
    (repo.endsWith('.git') || repo.endsWith('startmeup.bundle.zip'))
  ) {
    gitUrl = repo
  } else {
    throw new Error('repo invalid')
  }

  // Guess startmeup.bundle.zip file location
  let possibleBundleUrl = ''

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
    type: ArgTypes.GIT,
    gitUrl,
    branch,
    possibleBundleUrl,
    repoFolder,
    localFolder,
  } as GitArgs
}

export type StarterJsonConfig = {
  bundleUrl: string,
  repo: string,
  description: string,
  category: string,
}
function parseStarterArgs (argsv: string[]): StarterArgs {
  const [npx, startmeup, starter, localFolderParam] = argsv

  const localFolderRaw = localFolderParam || '.'
  const localFolder = path.join(process.cwd(), localFolderRaw)
  const startersJsonUrl = `https://raw.githubusercontent.com/aGuyNamedJonas/startmeup/main/starters/${starter}.json`

  return {
    type: ArgTypes.STARTER,
    starter,
    localFolder,
    starterJsonUrl: startersJsonUrl,
  } as StarterArgs
}