# Santari

[![Build Status](https://travis-ci.org/jeremyrajan/santari.svg?branch=master)](https://travis-ci.org/jeremyrajan/santari)
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

## Feedback/contributions
1. Open a issue tracker/PR for contributions.
2. Send an email jeremyrajan[at]gmail[dot]com.

---

Thanks to [Tomas Junnonen][1] for [npm-check-updates][2].


[1]: https://github.com/tjunnone
[2]: https://github.com/tjunnone/npm-check-updates
