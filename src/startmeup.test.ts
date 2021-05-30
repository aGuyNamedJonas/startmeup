import { ArgTypes, GitArgs } from "./lib"
import { startmeup, StartmeupProps } from "./startmeup"
import { parseArgs as actualParseArgs } from './lib'

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

    const repo = 'github.com/user/repo'
    const repoFolder = 'some/repo/subfolder'
    const tempDir = '/tmp/dir'
    const localFolder = '/some/local/folder'

    // args
    const mockArgs = {
      type: ArgTypes.GIT,
      gitUrl: 'https://github.com/user/repo.git',
      possibleBundleUrl: 'https://raw.githubusercontent.com/user/repo/main/startmeup.bundle.zip',
      repoFolder,
      localFolder,
    }


    test('Creates temp dir', async () => {
      const argsv = ['npx', 'startmeup', repo]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const tempDirCreator = jest.fn(() => tempDir)
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()

      await startmeup({ argsv, argsParser, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(tempDirCreator).toHaveBeenCalled()
    })

    test('Try to fetch mappedArgs.possibleBundleUrl (if set)', async () => {
      const argsv = ['npx', 'startmeup', repo]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn()
      const tempDirCreator = jest.fn(() => tempDir)
      const fileCopier = jest.fn()

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier } as unknown as StartmeupProps)
      expect(fetcher).toHaveBeenCalledWith(mockArgs.possibleBundleUrl, tempDir)
    })

    test('If no startmeup.bundle.zip is found, throw if git is not installed...', async () => {
      const argsv = ['npx', 'startmeup', repo]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const tempDirCreator = jest.fn(() => tempDir)

      const fetcher = jest.fn().mockRejectedValueOnce('network error about not being able to fetch startmeup.bundle.zip')
      const git = jest.fn().mockRejectedValueOnce('command not found: git')

      try {
        await startmeup({ argsv, fetcher, git, tempDirCreator, argsParser } as unknown as StartmeupProps)
      } catch (error) {
        expect(error.toString()).toBe('Error: Requires git to run')
      }
    })
  
    test('...otherwise, git-clone into temp folder', async () => {
      const argsv = ['npx', 'startmeup', repo]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => tempDir)
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(git).toHaveBeenCalledWith(`clone --depth=1 ${mockArgs.gitUrl} ${tempDir}`)
    })

    test('Throw if git clone fails', async () => {
      const argsv = ['npx', 'startmeup', repo]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => tempDir)
      
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
      const argsv = ['npx', 'startmeup', repo, repoFolder]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => tempDir)
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()

      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(fileCopier).toHaveBeenCalledWith(`${tempDir}/${repoFolder}`, localFolder)
    })

    test('Delete temp folder', async () => {
      const argsv = ['npx', 'startmeup', repo, repoFolder]
      const argsParser = jest.fn(() => ({ ...mockArgs } as GitArgs))
      const git = jest.fn().mockResolvedValue(true)
      const fetcher = jest.fn().mockRejectedValue(false)
      const tempDirCreator = jest.fn(() => tempDir)
      const fileCopier = jest.fn()
      const fileDestroyer = jest.fn()
      
      await startmeup({ argsv, argsParser, fetcher, git, tempDirCreator, fileCopier, fileDestroyer } as unknown as StartmeupProps)
      expect(fileDestroyer).toHaveBeenCalledWith(tempDir)
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