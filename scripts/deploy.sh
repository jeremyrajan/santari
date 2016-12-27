#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ]; then
  gulp deploy
fi