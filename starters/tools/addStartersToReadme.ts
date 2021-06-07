import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
const assert = require('assert')
const fetch = require('node-fetch')
const chalk = require('chalk')

main()

async function main () {
  const starterFilePaths = getAllStarterFiles()
  // const starterFileData = starterFilePaths
  //                           .map(readStarterFile)
  //                           .sort((a, b) => {
  //                             var nameA = a.starter.toUpperCase();
  //                             var nameB = b.starter.toUpperCase();
  //                             if (nameA < nameB) {
  //                               return -1;
  //                             }
  //                             if (nameA > nameB) {
  //                               return 1;
  //                             }
                            
  //                             // Namen müssen gleich sein
  //                             return 0;
  //                           })
  
  // console.log(JSON.stringify(starterFileData, null, 2))
  // const categories = starterFileData
}

function getAllStarterFiles () {
  const starterFiles = glob.sync('./starters/*.json')
  const absStarterFiles = starterFiles.map(starterFile => path.join(process.cwd(), starterFile))
  return absStarterFiles
}

async function readStarterFile (starterFilePath: string) {
  const starter = path.basename(starterFilePath)

  const starterFileRaw = fs.readFileSync(starterFilePath, 'utf-8')
  const { bundleUrl, repo, description, category } = JSON.parse(starterFileRaw)
  return { starter, bundleUrl, repo, description, category }
}