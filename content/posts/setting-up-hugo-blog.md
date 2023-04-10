+++
title = "Setting Up a Personal Blog using Hugo Static Site Generator and GitHub Pages"
date = "2023-04-10T19:51:20+02:00"
author = "Netlooker"
authorTwitter = "" #do not include @
cover = ""
tags = ["hugo", "github"]
keywords = ["hugo", "github pages", "static site generator"]
description = "A post about setting up a personal blog using Hugo Static Site Generator and GitHub Pages."
showFullContent = false
readingTime = true
hideComments = false
color = "" #color from the theme settings
+++

## The Background

As I was searching for the perfect solution to host my personal blog website, I found myself faced with a tough decision: should I go with the popular choice of WordPress or try something new with a static site generator?
After weighing the pros and cons of both options, I decided to take a leap and try out a static site generator. And that's when I discovered the [**Hugo Static Site Generator**](https://gohugo.io) - a project that immediately caught my attention and sparked my curiosity. With excitement and a bit of apprehension, I dive in and begin to explore all that this innovative tool has to offer.

## First Success in My Journey Back to Coding

I embarked on my coding journey after a too long break, being confident that it would be a relatively simple and well-documented process. However, Google Search and ChatGPT quickly reminded me that I was in for a bumpy ride. I spent some time learning and understanding each component of the puzzle. But finally, after getting a few more grey hairs and dedication, I succeeded! And to save you time, I'll cut to the chase and share my findings on how I made everything work.

### 1. Install Hugo
This step is simple when you follow [Installation Guide](https://gohugo.io/installation/) that is a part of quality documentation of Hugo Project.
In my case as I'm using Mac i just typed:
```shell-session
brew install hugo
```
Check if everything went fine checking the version of Hugo using the command:
```shell-session
hugo version
```
### 2. Init the Personal Blog Project
This part is also smooth and easy, just copy paste the following command that will create a project folder "blog" in the terminal. 
```shell-session
hugo new site blog
```
Next thing on the list is to initialize a Git repository using (I assume that you have Git already installed)
```shell-session
git init
```
### 3. Pick up the Starter Theme
To go further, a theme is required. Visit [Themes Page](https://themes.gohugo.io/) and select one you like. I am using [Terminal](https://themes.gohugo.io/themes/hugo-theme-terminal/#how-to-start) for its minimalistic and clean look. 
To use a theme, it must end up in the **themes** directory of the Hugo project. For ease of future updates, I found the git submodule technic the most convenient to follow.
```shell-session
git submodule add -f https://github.com/panr/hugo-theme-terminal.git themes/terminal
```
I suggest reading specific theme documentation to understand how it works and get more insights.

### 4. Create Hugo' Configuration File - hugo.yaml
I spent some time understanding how the configuration file works and the formats that can be used to encode it. If you wish to get more insights, I advise you to check [this page](https://gohugo.io/getting-started/configuration/).

To proceed faster, please find a template of the *".yaml"* format of the configuration [file]((https://gist.github.com/netlooker/dad86a321324e8aadd9425386fa3dbf1)) I created based on various sources and my preferences.Adjust its content to reflect your project' properties.

### 5. Create the First Post
Now it's time to take Hugo for a ride. I recommend using VS Code as your editor due to the quality extensions you can use to make your relationship with Hugo easier :)
To create your first post placeholder following a template that the theme delivers (get familiar with [Archetypes]((https://gohugo.io/content-management/archetypes/)) paste the following command:
```shell-session
hugo new posts/the-first-post.md
```
You will find a new file, "*the-first-post.md*" in the *content/posts* folder ready for your MarkDown formatted input.
You can also explore the *exampleSite* folder located in the Terminal theme to get some inspiration.
When you finish run the magic Hugo local server to see the outcomes of your work in your browser.
Run the following command that will make your project accessible under http://localhost:1313/ address:
```shell-session
hugo server
```
I hope that everything went fine and you can jump to the next step.

### 6 - Host on GitHub Pages
Follow Hugo' documentation about [setting up hosting on GitHub](https://gohugo.io/hosting-and-deployment/hosting-on-github/).
**Bear in mind** that if you used the git submodule solution for installing a theme, you must adjust a part of .github/workflows/hugo.yaml file.
I will let you discover it (the source of some new grey hairs), providing the one which works [.github/workflows/hugo.yaml](https://gist.github.com/netlooker/4d19b2cfed33599911bc6debd43629d1).

You can run GitHub Actions manually from the Actions menu.

## Enjoy your free statically generated blog!
