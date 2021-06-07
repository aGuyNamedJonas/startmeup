import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
import execa from 'execa'
const assert = require('assert')
const fetch = require('node-fetch')
const chalk = require('chalk')

main()

async function main () {
  const starterFilePaths = getAllStarterFiles()
  const starterFileData = starterFilePaths
                            .map(readStarterFile)
                            .sort((a, b) => {
                              if (a.starter < b.starter) return -1;
                              if (a.starter > b.starter) return 1;
                              return 0;
                            })

  const categories = Object.keys(starterFileData.reduce((categoryObj, { category }) => ({ ...categoryObj, [category]: category }), {}))
                            .sort((a, b) => {
                              if (a < b) return -1;
                              if (a > b) return 1;
                              return 0;
                            })

  const startersReadmeDoc = renderReadme(categories, starterFileData)
  const originalReadme = fs.readFileSync('README.md', 'utf-8')

  const STARTER_LIST_START = '<!---STARTER_LIST_START-->'
  const STARTER_LIST_END = '<!---STARTER_LIST_END-->'
  const [beforeStarters] = originalReadme.split(STARTER_LIST_START)
  const [_, afterStarters] = originalReadme.split(STARTER_LIST_END)

  const newReadmeDoc = [
    beforeStarters,
    STARTER_LIST_START,
    startersReadmeDoc,
    STARTER_LIST_END,
    afterStarters,
  ].join('\n')

  fs.writeFileSync('README.md', newReadmeDoc)
  // await execa.command('git add ./README.md')
  // await execa.command('git commit -m "Update starters in README"')
}

function getAllStarterFiles () {
  const starterFiles = glob.sync('./starters/*.json')
  const absStarterFiles = starterFiles.map(starterFile => path.join(process.cwd(), starterFile))
  return absStarterFiles
}

function readStarterFile (starterFilePath: string) {
  let starter = path.basename(starterFilePath)
  starter = starter.split('.json')[0]

  const starterFileRaw = fs.readFileSync(starterFilePath, 'utf-8')
  const { bundleUrl, repo, description, category } = JSON.parse(starterFileRaw)
  return { starter, bundleUrl, repo, description, category }
}

function renderReadme (categories: string[], starterFileData: any[]) {
  const readmeStr = categories.map(category => {
    const filteredStarters = starterFileData.filter(({ category: starterCategory }) => starterCategory === category)
    const headline = `#### **${category}**`
    const items = filteredStarters.map(
      ({ starter, repo, description }) => `* [${starter}](${repo}) - ${description}  `
    )

    return [headline, ...items].join('\n')
  })

  return readmeStr.join('\n')
}