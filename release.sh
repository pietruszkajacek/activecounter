#!/usr/bin/env sh
# Colors because colourful terminals are pretty!
RED='\033[1;31m' # RED
NC='\033[0m' # NO COLOUR
# step 1 - merge release branch to master
# Ensure the release branch argument exist
if ! [ $1 ]; then
  echo $RED
  echo "> Missing required param <branch_name>"
  echo $NC
  exit
fi
# $1 is the branch name passed when you run the release 
# i.e yarn release release/sprint-4
git merge $1
echo "> $1 merged to main"
echo ""
# step 2 - update build hash and create a new build.json
git show -s --format='{"build": "%h", "date": "%cD", "author": "%an" }' > build.json
# Where all the app version magic happens. I will explain this part in detail
node build-config.js
# step 4 - commit package.json and build.json changes and push
git add . && git commit -m "build(versioning): Release - Update app version."
# git push
# step 5 - create release tag
# PACKAGE_VERSION=$(cat package.json | grep \\\"version\\\" | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]') && git tag v$PACKAGE_VERSION && git push --tags