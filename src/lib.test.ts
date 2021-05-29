import { parseArgs } from "./lib"

describe('parseArgs', () => {
  test('Sets property "empty" to true if empty args were given', () => {
    expect(parseArgs(['npx', 'startmeup'])).toStrictEqual({ empty: true })
  })

  describe('Returns correct git URLs for github, bitbucket, gitlab shorthands', () => {
    test('Returns correct git URLs for default ("main") branch', () => {
      const githubArgs = parseArgs(['npx', 'startmeup', 'github.com/user/repo'])
      expect(githubArgs.gitUrl).toBe('https://github.com/user/repo.git')

      const gitlabArgs = parseArgs(['npx', 'startmeup', 'gitlab.com/user/repo'])
      expect(gitlabArgs.gitUrl).toBe('https://gitlab.com/user/repo.git')

      const bitbucketArgs = parseArgs(['npx', 'startmeup', 'bitbucket.org/user/repo'])
      expect(bitbucketArgs.gitUrl).toBe('https://bitbucket.org/user/repo.git')
    })
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

  test('Throws for invalid args', () => {
    const shortHandInvalid = 'selfhosted.gitlab.com/user/repo'
    const httpsUrlNoGitAtTheEnd = 'https://github.com/repo/user'
    const defaultArgs = ['npx', 'startmeup']
    expect(() => parseArgs([...defaultArgs, shortHandInvalid])).toThrow('repo invalid')
    expect(() => parseArgs([...defaultArgs, httpsUrlNoGitAtTheEnd])).toThrow('repo invalid')
  })
})