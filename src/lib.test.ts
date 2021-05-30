import * as path from 'path'
import { parseArgs } from "./lib"

describe('parseArgs', () => {
  test('Sets property "empty" to true if empty args were given', () => {
    expect(parseArgs(['npx', 'startmeup'])).toStrictEqual({ empty: true })
  })

  test('Returns correct git URL for github', () => {
    const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo'])
    expect(args.gitUrl).toBe('https://github.com/user/repo.git')
  })

  test('Returns correct git URL for gitlab', () => {
    const args = parseArgs(['npx', 'startmeup', 'gitlab.com/user/repo'])
    expect(args.gitUrl).toBe('https://gitlab.com/user/repo.git')
  })

  test('Returns correct git URL for bitbucket', () => {
    const args = parseArgs(['npx', 'startmeup', 'bitbucket.org/user/repo'])
    expect(args.gitUrl).toBe('https://bitbucket.org/user/repo.git')
  })

  test('Returns .git URL as is', () => {
    const gitUrl = 'https://github.com/user/repo.git'
    const args = parseArgs(['npx', 'startmeup', gitUrl])
    expect(args.gitUrl).toBe(gitUrl)
  })

  test('Returns startmeup.bundle.zip URL as is', () => {
    const selfHostedGitlabExample = 'https://git.example.com/user/repo/-/raw/main/src/startmeup.bundle.zip'
    const args = parseArgs(['npx', 'startmeup', selfHostedGitlabExample])
    expect(args.gitUrl).toBe(selfHostedGitlabExample)
  })

  test('Throws for invalid repo', () => {
    const shortHandInvalid = 'selfhosted.gitlab.com/user/repo'
    const httpsUrlNoGitAtTheEnd = 'https://github.com/repo/user'
    const defaultArgs = ['npx', 'startmeup']
    expect(() => parseArgs([...defaultArgs, shortHandInvalid])).toThrow('repo invalid')
    expect(() => parseArgs([...defaultArgs, httpsUrlNoGitAtTheEnd])).toThrow('repo invalid')
  })

  test('Correctly extracts custom branch or sticks with default ("main")', () => {
    const defaultArgs = parseArgs(['npx', 'startmeup', 'github.com/user/repo'])
    const customArgs = parseArgs(['npx', 'startmeup', 'gitlab.com/user/repo:development'])
    
    expect(defaultArgs.branch).toBe('main')
    expect(customArgs.branch).toBe('development')
  })

  test('Correctly sets possibleBundleUrl when repo is https://.../startmeup.bundle.zip', () => {
    const selfHostedGitlabExample = 'https://git.example.com/user/repo/-/raw/main/src/startmeup.bundle.zip'
    const args = parseArgs(['npx', 'startmeup', selfHostedGitlabExample])
    expect(args.possibleBundleUrl).toBe(selfHostedGitlabExample)
  })

  describe('possibleBundleUrl - Github', () => {
    test('Correctly guesses possibleBundleUrl for github (default branch, no subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo'])
      expect(args.possibleBundleUrl).toBe('https://raw.githubusercontent.com/user/repo/main/startmeup.bundle.zip')
    })
  
    test('Correctly guesses possibleBundleUrl for github (custom branch, no subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo:development'])
      expect(args.possibleBundleUrl).toBe('https://raw.githubusercontent.com/user/repo/development/startmeup.bundle.zip')
    })
  
    test('Correctly guesses possibleBundleUrl for github (custom branch, repo subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo:development', 'subfolder/in/repo'])
      expect(args.possibleBundleUrl).toBe('https://raw.githubusercontent.com/user/repo/development/subfolder/in/repo/startmeup.bundle.zip')
    })
  })

  describe('possibleBundleUrl - Gitlab', () => {
    test('Correctly guesses possibleBundleUrl for Gitlab (default branch, no subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'gitlab.com/user/repo'])
      expect(args.possibleBundleUrl).toBe('https://gitlab.com/user/repo/-/raw/main/startmeup.bundle.zip?inline=false')
    })
  
    test('Correctly guesses possibleBundleUrl for Gitlab (custom branch, no subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'gitlab.com/user/repo:development'])
      expect(args.possibleBundleUrl).toBe('https://gitlab.com/user/repo/-/raw/development/startmeup.bundle.zip?inline=false')
    })
  
    test('Correctly guesses possibleBundleUrl for Gitlab (custom branch, repo subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'gitlab.com/user/repo:development', 'subfolder/in/repo'])
      expect(args.possibleBundleUrl).toBe('https://gitlab.com/user/repo/-/raw/development/subfolder/in/repo/startmeup.bundle.zip?inline=false')
    })
  })

  describe('possibleBundleUrl - Bitbucket', () => {
    test('Correctly guesses possibleBundleUrl for bitbucket (default branch, no subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'bitbucket.org/user/repo'])
      expect(args.possibleBundleUrl).toBe('https://bitbucket.org/user/repo/raw/main/startmeup.bundle.zip')
    })
  
    test('Correctly guesses possibleBundleUrl for bitbucket (custom branch, no subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'bitbucket.org/user/repo:development'])
      expect(args.possibleBundleUrl).toBe('https://bitbucket.org/user/repo/raw/development/startmeup.bundle.zip')
    })
  
    test('Correctly guesses possibleBundleUrl for bitbucket (custom branch, repo subfolder)', () => {
      const args = parseArgs(['npx', 'startmeup', 'bitbucket.org/user/repo:development', 'subfolder/in/repo'])
      expect(args.possibleBundleUrl).toBe('https://bitbucket.org/user/repo/raw/development/subfolder/in/repo/startmeup.bundle.zip')
    })
  })
  
  test('Default for repoSubfolder is "."', () => {
    const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo'])
    expect(args.repoFolder).toBe('.')
  })

  test('When repoSubfolder is set, use it', () => {
    const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo', 'subfolder/in/repo'])
    expect(args.repoFolder).toBe('subfolder/in/repo')
  })

  test('Default for localFolder is "." (and is an absolute path, using cwd as base)', () => {
    const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo'])
    expect(args.localFolder).toBe(path.join(process.cwd(), '.'))
    expect(path.isAbsolute(args.localFolder)).toBeTruthy()
  })

  test('When localFolder is set, use it (and is an absolute path, using cwd as base)', () => {
    const args = parseArgs(['npx', 'startmeup', 'github.com/user/repo', '.', 'some/local/folder'])
    expect(args.localFolder).toBe(path.join(process.cwd(), 'some/local/folder'))
    expect(path.isAbsolute(args.localFolder)).toBeTruthy()
  })

  test('When starter arg is set, returns "isStarter": true and name of starter (in "starter")', () => {
    const args = parseArgs(['npx', 'startmeup', 'starter-name'])
    expect(args.isStarter).toBe(true)
    expect(args.starter).toBe('starter-name')
  })

  test('When starter arg is set and repo-subfolder, starterSubfolder is set', () => {
    const args = parseArgs(['npx', 'startmeup', 'starter-name', 'starter/sub/folder'])
    expect(args.isStarter).toBe(true)
    expect(args.starter).toBe('starter-name')
    expect(args.starterSubfolder).toBe('starter/sub/folder')
  })
})