# startmeup
> Jumpstart coding by downloading any git repo (sub)folder

# Features
**✓ Download from any git repo** - Github, Bitbucket, Gitlab and custom git servers supported  
**✓ Repo subfolder support** - Keep multiple starters in one repo  
**✓ (Optional) No git clone needed** - If you bundle code as `startmeup.bundle.zip`  
**✓ (Optional) Shorthand support** - Run `$ npx startmeup <starter>` for starters registered in starters.json (see below)

# Starters
> Just run `$ npx startmeup <starter>` ([Add your own starters](#add-your-own-starters))

[cdk-construct-starter](https://github.com/aGuyNamedJonas/cdk-construct-starter) · [cdk-stack-starter](https://github.com/aGuyNamedJonas/cdk-stack-starter)

# Usage
## 1. The universal way
`$ npx startmeup github.com/aGuyNamedJonas/cdk-stack-starter`  
Works for Github, Gitlab, Bitbucket and any git repository.

## 2. The fast way
`$ npx startmeup github.com/aGuyNamedJonas/cdk-construct-starter`  

Startmeup automatically checks for the presence of a `startmeup.bundle.zip` in the repo (subfolder). If a bundle is present this avoids a time consuming git-clone.

[Creating a startmeup.bundle.zip](#creating-a-startmeup.bundle.zip)

## 3. The convenient way
`$ npx startmeup cdk-stack-starter`  

For any `startmeup.bundle.zip` bundle registered in `starter.json`, you can simply run `$ npx startmeup <starter>`.  

[Add your own starters](#add-your-own-starters)

## Full usage
Run startmeup without args to see usage (`$ npx startmeup`)  
```
Usage:
$ npx startmeup repo[:branch] [repoSubfolder] [localFolder]  

Options:  
repo          Repository to download from - has to be one of:  
              github.com/<user>/<repo>  
              gitlab.com/<user>/<repo>  
              bitbucket.org/<user>/<repo>  
              https://<path to repo>.git  
              https://<path to bundle>/startmeup.bundle.zip  
branch        (Optional) Branch to use (default: main)  
repoSubfolder (Optional) Repository subfolder (default: .)  
localFolder   (Optional) Local folder to download to (default: CWD)
```

# Creating a startmeup.bundle.zip
> Only works on Github, Gitlab and Bitbucket (not on custom or self-hosted git servers)  

By adding a `startmeup.bundle.zip` file to your repo (or subfolder), you can significantly speed-up the usage of your starter (avoids having to run git-clone):

**How to create a startmeup.bundle.zip**  
1. `cd` into your starter's (sub)folder  
2. Run `$ zip startmeup.bundle.zip ./* .* -x ".git"`  
(Includes hidden files, excludes .git folder)
3. Commit & Push
4. Run `$ npx startmeup github.com/your-user/your-repo <subfolder>` - startmeup will now detect your bundle and download that instead of doing a full git clone

# Add your own starters
After you created a `startmeup.bundle.zip` bundle (see above) to speed up the whole process, make it convenient by adding the bundle to `starters.json`.

Now everyone can use your starter by simply running `$ npx startmeup <starter>`

New entries to `starters.json` are auto-merged.

# Why?
I love the convenience of how tools like `create-react-app` or `cdk init` speed up development by downloading starter-templates for you.  

I wanted the same convenience for building, reusing & sharing my own starter-templates.

# Contribute
[How to contribute](./CONTRIBUTING.md)

# License
MIT
