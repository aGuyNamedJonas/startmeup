# startmeup
Download any git repo (sub)folder to jumpstart coding

# Features
**✓ Download from any git repo** - Github, Bitbucket, Gitlab and custom git servers supported  
**✓ Repo subfolder support** - Keep multiple starters in one repo  
**✓ (Optional) No git clone needed** - If you bundle code as `startmeup.bundle.zip`  
**✓ (Optional) Shorthand support** - Run `$ npx startmeup <starter>` for starters registered in starters.json (see below)

# Usage
`$ npx startmeup github.com/<user>/<repo>[:branch] [<repo subfolder>] [<local folder>]` 

# Starters
> Just run `$ npx startmeup <starter>` (👉🏻 [Add your own starters](#add-your-own-starters))

[cdk-construct-starter](https://github.com/aGuyNamedJonas/cdk-construct-starter) · [cdk-stack-starter](https://github.com/aGuyNamedJonas/cdk-stack-starter)

# Creating a startmeup.bundle.zip
> Only works on Github, Gitlab and Bitbucket (not on custom or self-hosted git servers)  

By adding a `startmeup.bundle.zip` file to your repo (or subfolder), you can significantly speed-up the usage of your starter (lets `startmeup` avoid running `git clone` in the background):

**How to create a startmeup.bundle.zip**  
1. `cd` into your starter's (sub)folder  
2. Run `$ zip startmeup.bundle.zip ./* .* -x ".git"`  
(Includes hidden files, excludes .git folder)
3. Commit & Push
4. Run `$ npx startmeup github.com/your-user/your-repo <subfolder>` - startmeup will now detect your bundle and download that instead of doing a full git clone 👍🏻

# Add your own starters
> Adding your bundle to `starters.json` lets people run `$ npx startmeup <your-starter-name>` to get it.

After you created a `startmeup.bundle.zip` bundle to speedup usage of your starter, make it even more convenient to use by adding it to `starters.json` ✌🏻

New entries to `starters.json` are auto-merged.

# Why?
I love the convenience how tools like `create-react-app` or `cdk init` allow you to quickly setup a template to start coding fast.  

However I didn't find an easy way to build & reuse (+ share) my own starter-templates - that's why I created startmeup.

# Contribute
[How to contribute](./CONTRIBUTING.md)

# License
MIT
