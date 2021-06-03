import { ArgTypes, GitArgs } from "./lib"
import { startmeup, StartmeupProps } from "./startmeup"
import { argsParser as actualParseArgs } from './lib'

beforeEach(() => {
  jest.resetAllMocks()
})

describe('startmeup', () => {
  describe('Mapping args', () => {
    test('Calls argsParser with argsv', async () => {
      const argsv = ['npx', 'startmeup', 'starter-name']
      const argsParser = jest.fn(() => ({} as GitArgs))

      await startmeup({ argsv, argsParser } as unknown as StartmeupProps)
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
    test.todo('If starter-shorthand is provided, look it up in starters.json')
    test.todo('Throw if starter cannot be found in starters.json')
    test.todo('Use bundleUrl of starter to fetch startmeup.bundle.zip')
    test.todo('Throw if bundle cannot be downloaded')
    test.todo('Unzip downloaded bundle to mappedArgs.localFolder')
    test.todo('Delete zip file when done')
  })
})