# Register your starter!
Afford anyone the maxium convenience in using your starter by registering it!

After you're done registering it here, anyone can simply run:  
`$ npx startmeup <your-amazing-starter>`

## Step #1
**Create startmeup.bundle.zip** (run this in your starter's root):

`$ zip startmeup.bundle.zip ./* .* -x ".git"`  
(Includes hidden files, excludes .git folder)

## Step #2
**Add JSON file for your starter** to **this folder**.  
Just copy'n'adapt one of the existing files ou find here, or see [reference](#reference) for full docs.

## Step #3
**Submit a PR** with your starter changes. I will merge them as quickly as I can (there's two status checks to help me do that).

## Step #4
**Add the badge** to your repo:  
![$ npx startmeup supported](https://img.shields.io/static/v1?label=$npx%20startmeup%20&color=CB3837&logo=npm&message=<starter>)  

`![$ npx startmeup supported](https://img.shields.io/static/v1?label=$npx%20startmeup%20&color=CB3837&logo=npm&message=<starter>)`

# Reference
## Example 
*cdk-stack-starter.json*
```
{
  "bundleUrl": "https://raw.githubusercontent.com/aGuyNamedJonas/cdk-stack-starter/main/startmeup.bundle.zip",
  "repo": "https://github.com/aGuyNamedJonas/cdk-stack-starter",
  "description": "Sensible, minimalistic CDK Stack Starter (TS)",
  "category": "CDK"
}
```

## Attributes (all required)
- **bundleUrl** - URL to your `startmeup.bundle.zip`
  - Needs to be a Github.com, Gitlab.com or Bitbucket.org *raw* URL
  - Validation will do a head-request to make sure the file is publicly reachable
  - *Example* `https://raw.githubusercontent.com/aGuyNamedJonas/cdk-stack-starter/main/startmeup.bundle.zip`
- **repo** - HTTPs URL to the associated repository
  - Needs to be a HTTPs URL to a Github.com, Gitlab.com, or Bitbucket.org repository
  - Validation will make sure the repo & bundle URL originate from the same repository
  - *Example* `https://github.com/aGuyNamedJonas/cdk-stack-starter`
- **description** - Short description of your starter
  - Makes it easier for people to choose the right starters
  - Will be displayed in our [starters-list](https://github.com/aGuyNamedJonas/startmeup#starters)
  - *Example* `Sensible, minimalistic CDK Stack Starter (TS)`
- **category** - Category to place your starter in
  - We use category-groups on our [starters-list](https://github.com/aGuyNamedJonas/startmeup#starters)
  - No hard / fast rules on this one - use your best judgement :)\
  - *Example* `CDK` / `react` / `vimrc`