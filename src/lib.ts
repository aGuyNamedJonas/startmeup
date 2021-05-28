type StartmeupArgs = {
  gitUrl: string,
  possibleBundleUrl: string,
  repositoryFolder: string,
  localFolder: string,
}

export function parseArgs (argsv: string[]): StartmeupArgs | null {
  if (argsv.length === 2) {
    return null
  }

  
}