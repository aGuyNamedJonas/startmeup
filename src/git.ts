import * as path from 'path'
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
    await execa.command('git version')
  } catch (error) {
    return false
  }

  return true
}

export async function shallowClone (gitHttpsUrl: string, tmpDir: string) {
  // TODO: Improvement idea might be to do --no-checkout and then list the files with git ls-tree --name-only -r HEAD & manually fetch from github
  await execa.command(`git clone --depth=1 ${gitHttpsUrl} ${tmpDir}`)
}