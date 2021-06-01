import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import execa from 'execa'
import extract from 'extract-zip'
import { ncp } from 'ncp'

// TODO: Test this, yes even this stuff can be tested, Jonas :)

// Stolen from:
// https://stackoverflow.com/a/26038979
export function fetcher(url: string, destinationFolder: string): Promise<void> {
  const fileName = path.basename(url)
  const outputFolder = path.isAbsolute(destinationFolder)
                        ? destinationFolder
                        : path.join(process.cwd(), destinationFolder)

  const outputFile = path.join(outputFolder, fileName)

  return new Promise((resolve, reject) => {
    var responseSent = false;
    https.get(url, (response: any) => {
      if (response.statusCode !== 200) {
        reject('Non 200 response code: ' + response.statusCode)
        return
      }

      const file = fs.createWriteStream(outputFile);
      fs.mkdirSync(outputFolder, { recursive: true })

      response.pipe(file);
      file.on('finish', () =>{
        file.close();
        if(responseSent)  return;
        responseSent = true;
        resolve();
      });
    }).on('error', (err: Error) => {
        if(responseSent)  return;
        responseSent = true;
        reject(err);
    });
  });
}

export function fileDestroyer (targetFile: string){
  fs.rmdirSync(targetFile, { recursive: true })
}

export function tempDirCreator () {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'startmeup-')) 
}

export async function git (gitCmd: string): Promise<void> {
  return await execa.command(`git ${gitCmd}`) as unknown as Promise<void>
}

export async function unzip (sourceFile: string, targetFolder: string): Promise<void> {
  await extract(sourceFile, { dir: targetFolder })
}

export async function fileCopier (sourceFolder: string, destinationFolder: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ncp(sourceFolder, destinationFolder, {
      filter: (fileName: string) => !fileName.includes('.git/')
    }, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}