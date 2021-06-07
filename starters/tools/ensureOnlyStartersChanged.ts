import execa from 'execa'

main ()

async function main () {
  try {
    await ensureOnlyStartersChanged()
  } catch (error) {
    console.log(error.toString())
    process.exit(1)
  }

  console.log('Only starter files were changed')
  process.exit(0)
}

async function ensureOnlyStartersChanged () {
  const changed = await getChangedFiles()
  const starterFilesMatcher = /^\/starters\/([a-z0-9]+-)*[a-z0-9]+.json$/g
  changed.forEach((changedFile: string) => {
    if (!changedFile.match(starterFilesMatcher)) {
      console.log('Non-starter file was changed: ', changedFile)
      process.exit(1)
    }
  })
}

async function getChangedFiles (branch = 'main'): Promise<string[]> {
  await execa.command('git fetch origin main:main')
  const { stdout } = await execa.command('git diff origin/main HEAD --name-only')
  const changedFiles = stdout.split('\n')
  return changedFiles
}