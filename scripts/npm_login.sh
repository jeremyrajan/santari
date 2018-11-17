#!/bin/bash
set -o nounset
set -o errexit

npm adduser <<!
$NPM_USERNAME
$NPM_PASSWORD
$NPM_EMAIL
!
