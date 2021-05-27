import execa from "execa";

export enum GIT_PLATFORM {
  GITHUB = 'GITHUB',
  // Currently not supported - PRs welcome :)
  GITLAB = 'GITLAB',
  // Currently not supported - PRs welcome :)
  BITBUCKET = 'BITBUCKET'
}

export async function isGitInstalled () {
  try {
    await execa('git', ['version'])
  } catch (error) {
    return false
  }

  return true
}