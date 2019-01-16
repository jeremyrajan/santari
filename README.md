# Santari

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b24ceaee9b6e4188b06a9b005299bd3d)](https://app.codacy.com/app/jeremyrajan/santari?utm_source=github.com&utm_medium=referral&utm_content=remicass/santari&utm_campaign=Badge_Grade_Settings)
[![Build Status](https://travis-ci.org/remicass/santari.svg?branch=tests)](https://travis-ci.org/remicass/santari)
[![npm version](https://badge.fury.io/js/santari.svg)](https://badge.fury.io/js/santari)
[![david.dm](https://david-dm.org/jeremyrajan/santari.svg)](https://david-dm.org/jeremyrajan/santari)

[![NPM](https://nodei.co/npm/santari.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/santari/)

## About
Santari (a.k.a sentry. Refer: http://www.dictionary4edu.com/santari-english-meaning.html) stands for guardsman/watchman in hindi.
Santari looks for dependencies in your project and creates a PR with the latest dependency changes.

## What it does
1. Gets your package.json file from your project and runs `npm-check-updates` in background.
2. If there are dependencies to be updated. It creates a new branch with updated dependencies package.json.
3. If a branch exists with the updated dependencies, branch and PR creation is avoided.
4. If you have locked version for deps, they are not overridden.

![image](https://cloud.githubusercontent.com/assets/2890683/19828761/93546cc4-9e01-11e6-8840-a931ce7f6711.png)

## Usage

Create an environment variable `GITHUB_KEY` with your github access token. For more
details visit https://github.com/blog/1509-personal-api-tokens.

Please make sure, you have read-write access to the repo(s).

```
[sudo] npm i -g santari

santari --repo jeremyrajan/santari 

```

Replace the repo option with `username/repo-name`.

The repo will be read from your package.json `repository` property if you do not specify it here.

#### Options

You can pass the following options:
1. `--repo -r`: Pass the repository here. Required if it cannot be parsed from your package.json or read from `.santari.json`.
1. `--dry -d`: If you pass this as argument then, santari will not create PR/branches and will only display the latest
  packages to be updated.

  ex: `santari --repo <author>/<repo> --dry`

2. `--config -c`: From version > 2.5.0 you can pass a config file option wherein you can set PR details. Check [`.santari.json`](.santari.json) in
  this repo. If you do not specify a config file, the library will look for one in the directory it was executed from.

  ex: `santari --repo <author>/<repo> --c .santari.json`
  
3. `--host -h`: specify an alternate github host. Useful for Github Enterprise usecases.
4. `--token -t`: pass your API token here instead of using the environment variable above.
5. `--message -m`: override the default git commit message. 

## Automatic Checking

> Please note that this example uses travis CI.

1. Add `GITHUB_KEY` with your access token as `ENV` variable or specify it on the command line with `--token` in step 3 below.
2. Add `npm i -g santari` to [`before_install`](https://github.com/jeremyrajan/santari/blob/master/.travis.yml#L12)
3. Add `santari --repo <author>/<name_of_repo>` to [`after_success`](https://github.com/jeremyrajan/santari/blob/master/.travis.yml#L13)
4. Configure cron in travis CI for the repo. You have a choice between daily, weekly or monthly.

This repo, is configured for automatic updates on a daily basis, [.travis.yml](https://github.com/jeremyrajan/santari/blob/master/.travis.yml). For more details on cron jobs for travis, please refer [here](https://docs.travis-ci.com/user/cron-jobs/).

![image](https://cloud.githubusercontent.com/assets/2890683/21299994/9fac86a8-c5db-11e6-9ff3-d9aa29e1c4e4.png)

The setup is the same, if your CI supports cron jobs.

## Feedback/contributions
1. Open a issue tracker/PR for contributions.
2. Send an email jeremyrajan[at]gmail[dot]com.

---

Thanks to [Tomas Junnonen][1] for [npm-check-updates][2].


[1]: https://github.com/tjunnone
[2]: https://github.com/tjunnone/npm-check-updates
