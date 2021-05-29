type StartmeupArgs = {
  empty?: boolean,
  gitUrl: string,
  possibleBundleUrl: string,
  repositoryFolder: string,
  localFolder: string,
}

export function parseArgs (argsv: string[]): StartmeupArgs {
  if (argsv.length === 2) {
    return { empty: true } as StartmeupArgs
  }

  const [npx, startmeup, repo, repoSubfolder, localFolder] = argsv

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

  return {
    gitUrl
  } as StartmeupArgs
}