describe('startmeup', () => {
  describe('Mapping args', () => {
    test.todo('Calls printusage if mappedArgs.empty is set to true')
    test.todo('Throws when args are invalid')
  })

  describe('Starter shorthand provided', () => {
    test.todo('If starter-shorthand is provided, look it up in starters.json')
    test.todo('Throw if starter cannot be found in starters.json')
    test.todo('Use bundleUrl of starter to fetch startmeup.bundle.zip')
    test.todo('Throw if bundle cannot be downloaded')
    test.todo('Unzip downloaded bundle to mappedArgs.localFolder')
    test.todo('Delete zip file when done')
  })
  
  describe('github / bitbucket / gitlab / git URL provided', () => {
    test.todo('Try to fetch mappedArgs.possibleBundleUrl')
    test.todo('Skip trying to fetch bundle, if not a github / bitbucket / gitlab repo URL')
    test.todo('If no startmeup.bundle.zip is found, throw if git is not installed...')
    test.todo('...otherwise, git-clone into temp folder')
    test.todo('Throw if git clone fails')
    test.todo('Copy clone (sub)folder into destination')
    test.todo('Delete temp folder')
  })
})