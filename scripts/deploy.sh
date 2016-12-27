#!/bin/bash

if ([ $TRAVIS_BRANCH == "master" ] && [ $TRAVIS_PULL_REQUEST == "false" ])
then
  gulp deploy
  echo 'Package build and published'
else
  echo "Build successful, but not publishing!"
fi