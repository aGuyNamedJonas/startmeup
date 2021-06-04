import * as path from 'path'
import { GitArgs, argsParser, StarterArgs } from "./lib"

describe('argsParser', () => {
  test('Sets property "empty" to true if empty args were given', () => {
    expect(argsParser(['npx', 'startmeup'])).toStrictEqual({ empty: true })
  })

  describe('GitArgs', () => {
    test('Returns correct git URL for github', () => {
      const args = argsParser(['npx', 'startmeup', 'github.com/user/repo']) as GitArgs
      expect(args.gitUrl).toBe('https://github.com/user/repo.git')
    })
  
    test('Returns correct git URL for gitlab', () => {
      const args = argsParser(['npx', 'startmeup', 'gitlab.com/user/repo']) as GitArgs
      expect(args.gitUrl).toBe('https://gitlab.com/user/repo.git')
    })
  
    test('Returns correct git URL for bitbucket', () => {
      const args = argsParser(['npx', 'startmeup', 'bitbucket.org/user/repo']) as GitArgs
      expect(args.gitUrl).toBe('https://bitbucket.org/user/repo.git')
    })
  
    test('Returns .git URL as is', () => {
      const gitUrl = 'https://github.com/user/repo.git'
      const args = argsParser(['npx', 'startmeup', gitUrl]) as GitArgs
      expect(args.gitUrl).toBe(gitUrl)
    })
  
    test('Returns startmeup.bundle.zip URL as is', () => {
      const selfHostedGitlabExample = 'https://git.example.com/user/repo/-/raw/main/src/startmeup.bundle.zip'
      const args = argsParser(['npx', 'startmeup', selfHostedGitlabExample]) as GitArgs
      expect(args.gitUrl).toBe(selfHostedGitlabExample)
    })
  
    test('Throws for invalid repo', () => {
      const shortHandInvalid = 'selfhosted.gitlab.com/user/repo'
      const httpsUrlNoGitAtTheEnd = 'https://github.com/repo/user'
      const defaultArgs = ['npx', 'startmeup']
      expect(() => argsParser([...defaultArgs, shortHandInvalid])).toThrow('repo invalid')
      expect(() => argsParser([...defaultArgs, httpsUrlNoGitAtTheEnd])).toThrow('repo invalid')
    })
  
    test('Correctly extracts custom branch or sticks with default ("main")', () => {
      const defaultArgs = argsParser(['npx', 'startmeup', 'github.com/user/repo']) as GitArgs
      const customArgs = argsParser(['npx', 'startmeup', 'gitlab.com/user/repo:development']) as GitArgs
      
      expect(defaultArgs.branch).toBe('main')
      expect(customArgs.branch).toBe('development')
    })
  
    test('Correctly sets possibleBundleUrl when repo is https://.../startmeup.bundle.zip', () => {
      const selfHostedGitlabExample = 'https://git.example.com/user/repo/-/raw/main/src/startmeup.bundle.zip'
      const args = argsParser(['npx', 'startmeup', selfHostedGitlabExample]) as GitArgs
      expect(args.possibleBundleUrl).toBe(selfHostedGitlabExample)
    })
  
    describe('possibleBundleUrl - Github', () => {
      test('Correctly guesses possibleBundleUrl for github (default branch, no subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'github.com/user/repo']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://raw.githubusercontent.com/user/repo/main/startmeup.bundle.zip')
      })
    
      test('Correctly guesses possibleBundleUrl for github (custom branch, no subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'github.com/user/repo:development']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://raw.githubusercontent.com/user/repo/development/startmeup.bundle.zip')
      })
    
      test('Correctly guesses possibleBundleUrl for github (custom branch, repo subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'github.com/user/repo:development', 'subfolder/in/repo']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://raw.githubusercontent.com/user/repo/development/subfolder/in/repo/startmeup.bundle.zip')
      })
    })
  
    describe('possibleBundleUrl - Gitlab', () => {
      test('Correctly guesses possibleBundleUrl for Gitlab (default branch, no subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'gitlab.com/user/repo']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://gitlab.com/user/repo/-/raw/main/startmeup.bundle.zip?inline=false')
      })
    
      test('Correctly guesses possibleBundleUrl for Gitlab (custom branch, no subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'gitlab.com/user/repo:development']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://gitlab.com/user/repo/-/raw/development/startmeup.bundle.zip?inline=false')
      })
    
      test('Correctly guesses possibleBundleUrl for Gitlab (custom branch, repo subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'gitlab.com/user/repo:development', 'subfolder/in/repo']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://gitlab.com/user/repo/-/raw/development/subfolder/in/repo/startmeup.bundle.zip?inline=false')
      })
    })
  
    describe('possibleBundleUrl - Bitbucket', () => {
      test('Correctly guesses possibleBundleUrl for bitbucket (default branch, no subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'bitbucket.org/user/repo']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://bitbucket.org/user/repo/raw/main/startmeup.bundle.zip')
      })
    
      test('Correctly guesses possibleBundleUrl for bitbucket (custom branch, no subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'bitbucket.org/user/repo:development']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://bitbucket.org/user/repo/raw/development/startmeup.bundle.zip')
      })
    
      test('Correctly guesses possibleBundleUrl for bitbucket (custom branch, repo subfolder)', () => {
        const args = argsParser(['npx', 'startmeup', 'bitbucket.org/user/repo:development', 'subfolder/in/repo']) as GitArgs
        expect(args.possibleBundleUrl).toBe('https://bitbucket.org/user/repo/raw/development/subfolder/in/repo/startmeup.bundle.zip')
      })
    })
    
    test('Default for repoSubfolder is "."', () => {
      const args = argsParser(['npx', 'startmeup', 'github.com/user/repo']) as GitArgs
      expect(args.repoFolder).toBe('.')
    })
  
    test('When repoSubfolder is set, use it', () => {
      const args = argsParser(['npx', 'startmeup', 'github.com/user/repo', 'subfolder/in/repo']) as GitArgs
      expect(args.repoFolder).toBe('subfolder/in/repo')
    })
  
    test('Default for localFolder is "." (and is an absolute path, using cwd as base)', () => {
      const args = argsParser(['npx', 'startmeup', 'github.com/user/repo']) as GitArgs
      expect(args.localFolder).toBe(path.join(process.cwd(), '.'))
      expect(path.isAbsolute(args.localFolder)).toBeTruthy()
    })
  
    test('When localFolder is set, use it (and is an absolute path, using cwd as base)', () => {
      const args = argsParser(['npx', 'startmeup', 'github.com/user/repo', '.', 'some/local/folder']) as GitArgs
      expect(args.localFolder).toBe(path.join(process.cwd(), 'some/local/folder'))
      expect(path.isAbsolute(args.localFolder)).toBeTruthy()
    })
  })
  
  describe('StarterArgs', () => {
    test('When starter arg is set, sets the starter attribute', () => {
      const args = argsParser(['npx', 'startmeup', 'starter-name']) as StarterArgs
      expect(args.starter).toBe('starter-name')
    })

    test('startersJsonUrl is set to aGuyNamedJonas.com/startmeup/starters/<starter bane>.json', () => {
      const args = argsParser(['npx', 'startmeup', 'starter-name']) as StarterArgs
      expect(args.starterJsonUrl).toBe('https://raw.githubusercontent.com/aGuyNamedJonas/startmeup/main/starters/starter-name.json')
    })

    test('Default for localFolder is "." (and is an absolute path, using cwd as base)', () => {
      const args = argsParser(['npx', 'startmeup', 'starter-name']) as StarterArgs
      expect(args.localFolder).toBe(path.join(process.cwd(), '.'))
      expect(path.isAbsolute(args.localFolder)).toBeTruthy()
    })
  
    test('When localFolder is set, use it (and is an absolute path, using cwd as base)', () => {
      const args = argsParser(['npx', 'startmeup', 'starter-name', 'some/local/folder']) as StarterArgs
      expect(args.localFolder).toBe(path.join(process.cwd(), 'some/local/folder'))
      expect(path.isAbsolute(args.localFolder)).toBeTruthy()
    })
  })
})