import { ArgTypes, GitArgs, StarterArgs } from "./lib"
import { startmeup, StartmeupProps } from "./startmeup"
import { argsParser as actualParseArgs } from './lib'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('startmeup', () => {
  describe('Mapping args', () => {
    test('Calls argsParser with argsv', async () => {
      const argsv = ['npx', 'startmeup', 'starter-name']
      const argsParser = jest.fn(() => ({ starterJsonUrl: 'https://url.com/to/starter-config.json' } as StarterArgs))

      const tempDirCreator = jest.fn().mockReturnValue('/tmp/dir')
      const fetcher = jest.fn().mockResolvedValue({ 'starter-name': { 'description': 'My awesome starter' } })
      const fileReader = jest.fn().mockReturnValue(`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`)
      const unzip = jest.fn().mockResolvedValue(true)
      const fileDestroyer = jest.fn().mockResolvedValue(true)

      await startmeup({ argsv, argsParser, tempDirCreator, fetcher, fileReader, fileDestroyer, unzip } as unknown as StartmeupProps)
      expect(argsParser).toHaveBeenCalledWith(argsv)
    })

    test('Calls printusage if no args are provided', async () => {
      const argsv = ['npx', 'startmeup']
      const argsParser = jest.fn(() => ({ empty: true }) as GitArgs)
      const printUsage = jest.fn()

      await startmeup({ argsv, argsParser, printUsage } as unknown as StartmeupProps)
      expect(printUsage).toHaveBeenCalled()
    })

    test('Throws when args are invalid', async () => {
      const argsv = ['npx', 'startmeup', 'invalid.com/user/repo']
      try {
        await startmeup({ argsv, argsParser: actualParseArgs } as unknown as StartmeupProps)
      } catch (error) {
        expect(error).toBeTruthy()
      }
    })
  })
  
  describe('Git variant ($ npx startmeup repo[:branch] [repoSubfolder] [localFolder])', () => {
    beforeEach(() => jest.restoreAllMocks())

    // args
    const mockArgs = {
      type: ArgTypes.GIT,
      gitUrl: 'https://github.com/user/repo.git',
      possibleBundleUrl: 'https://raw.githubusercontent.com/user/repo/main/startmeup.bundle.zip',
      repoFolder: 'some/repo/subfolder',
      localFolder: '/some/local/folder',
    }


    test('Creates temp dir', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()

      await startmeup({ argsv, argsParser, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(tempDirCreator).toHaveBeenCalled()
    })

    test('Try to fetch mappedArgs.possibleBundleUrl (if set)', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn()
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip } as unknown as StartmeupProps)
      expect(fetcher).toHaveBeenCalledWith(mockArgs.possibleBundleUrl, '/tmp/dir')
    })

    test('If no startmeup.bundle.zip is found, throw if git is not installed...', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const tempDirCreator = jest.fn(() => '/tmp/dir')

      const fetcher = jest.fn().mockRejectedValueOnce('network error about not being able to fetch startmeup.bundle.zip')
      const git = jest.fn().mockRejectedValueOnce('command not found: git')

      try {
        await startmeup({ argsv, fetcher, git, tempDirCreator, argsParser } as unknown as StartmeupProps)
      } catch (error) {
        expect(error.toString()).toBe('Error: Requires git to run')
      }
    })
  
    test('...otherwise, git-clone into temp folder', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(git).toHaveBeenCalledWith(`clone --depth=1 ${mockArgs.gitUrl} /tmp/dir`)
    })

    test('Throw if git clone fails', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      
      const git = jest.fn(async (gitCmd: string) => {
        if (gitCmd.startsWith('version')) {
          return Promise.resolve(true)
        }

        if (gitCmd.startsWith('clone')) {
          throw new Error('Git error')
        }
      })

      try {
        await startmeup({ argsv, fetcher, git, tempDirCreator, argsParser } as unknown as StartmeupProps)
      } catch (error) {
        expect(error.toString()).toBe('Error: Git error')
      }
    })

    test('Copy clone (sub)folder into destination', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo', 'some/repo/subfolder']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(fileCopier).toHaveBeenCalledWith(`/tmp/dir/some/repo/subfolder`, '/some/local/folder')
    })

    test('Delete temp folder', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo', 'some/repo/subfolder']
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(fileDestroyer).toHaveBeenCalledWith('/tmp/dir')
    })

    test('If startmeup.bundle.zip is found, download it, extract it, move the files to the right place, then delete the temp folder', async () => {
      const argsv = ['npx', 'startmeup', 'github.com/user/repo', 'some/repo/subfolder']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.GIT,
        gitUrl: 'https://github.com/user/repo.git',
        possibleBundleUrl: 'https://raw.githubusercontent.com/user/repo/main/some/repo/subfolder/startmeup.bundle.zip',
        repoFolder: 'some/repo/subfolder',
        localFolder: '/some/local/folder',
      } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip } as unknown as StartmeupProps)
      expect(fetcher).toHaveBeenCalledWith('https://raw.githubusercontent.com/user/repo/main/some/repo/subfolder/startmeup.bundle.zip', '/tmp/dir')
      expect(tempDirCreator).toHaveBeenCalled()
      expect(unzip).toHaveBeenCalledWith('/tmp/dir/startmeup.bundle.zip', '/tmp/dir')
      expect(fileDestroyer).toHaveBeenCalledWith('/tmp/dir/startmeup.bundle.zip')
      expect(fileCopier).toHaveBeenCalledWith('/tmp/dir', '/some/local/folder')
      expect(fileDestroyer).toHaveBeenCalledWith('/tmp/dir')
    })
  })

  describe('Starter variant ($ npx startmeup starter [localFolder])', () => {
    test('If starter-shorthand is provided, look it up in /starters', async () => {
      const argsv = ['npx', 'startmeup', 'some-starter']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      expect(tempDirCreator).toHaveBeenCalled()
      expect(fetcher).toHaveBeenCalledWith('https://url.com/to/the/starter.json', '/tmp/dir')
    })

    test('Throw if starter cannot be found', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starters.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue('404 - not found')
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      
      try {
        await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip } as unknown as StartmeupProps)
      } catch (error) {
        expect(error.toString()).toBe('Error: Could not find https://url.com/to/the/starters.json')
      }
    })

    test('Use file reader to read starter json file', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter-config.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      expect(fileReader).toHaveBeenCalledWith('/tmp/dir/starter-config.json')
    })

    test('Use bundleUrl of starter to fetch startmeup.bundle.zip', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter-config.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      expect(fetcher).toHaveBeenCalledWith('https://url.com/to/the/startmeup.bundle.zip', '/tmp/dir')
    })

    test('Bugfix: Make sure JSON file is properly parsed', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter-config.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      expect(fetcher).toHaveBeenCalledWith('https://url.com/to/the/startmeup.bundle.zip', '/tmp/dir')
    })

    test('Throw if bundle cannot be downloaded', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter-config.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn(url => {
        if (url === 'https://url.com/to/the/startmeup.bundle.zip') {
          throw new Error('404 - Not found')
        }

        return Promise.resolve(true)
      })
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))
      
      try {
        await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      } catch (error) {
        expect(error.toString()).toBe('Error: Could not fetch https://url.com/to/the/startmeup.bundle.zip')
      }
    })

    test('Unzip downloaded bundle to mappedArgs.localFolder', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter-config.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      expect(unzip).toHaveBeenCalledWith('/tmp/dir/startmeup.bundle.zip', '/some/local/folder')      
    })

    test('Delete temp folder when done', async () => {
      const argsv = ['npx', 'startmeup', 'starter-does-not-exist']
      const argsParser = jest.fn(() => ({
        type: ArgTypes.STARTER,
        starter: 'some-starter',
        localFolder: '/some/local/folder',
        starterJsonUrl: 'https://url.com/to/the/starter-config.json',
      } as StarterArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => '/tmp/dir')
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      const unzip = jest.fn().mockResolvedValue(true)
      const fileReader = jest.fn(() => (`{
        "bundleUrl": "https://url.com/to/the/startmeup.bundle.zip",
        "repo": "https://github.com/user/repo",
        "description": "description",
        "category": "category"
      }`))

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer, unzip, fileReader } as unknown as StartmeupProps)
      expect(fileDestroyer).toHaveBeenCalledWith('/tmp/dir')      
    })
  })
})