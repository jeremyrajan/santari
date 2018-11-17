#!/bin/bash
# set -o nounset
# set -o errexit

# npm adduser <<!
# $NPM_USERNAME
# $NPM_PASSWORD
# $NPM_EMAIL
# !
echo -e "$NPM_USERNAME\n$NPM_PASSWORD\n$NPM_EMAIL" | npm login
