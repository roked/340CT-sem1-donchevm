#!/bin/sh

set -e # using the options command to abort script at first error
echo
echo "PRE-COMMIT"

EMAIL=$(git config user.email)

# make sure the user has registered a valid university email address
if [[ $EMAIL != *"@coventry.ac.uk" ]]; then
	echo "  invalid config settings"
	echo "  Your registered email is currently '$EMAIL'"
	echo "  please run the following git commands:"
	echo "    $ git config user.email xxx@coventry.ac.uk"
	echo "    $ git config user.name 'zzz'"
	echo "  where 'xxx' is your university username"
	echo "  and 'zzz' is your name as it appears on your university ID badge"
	echo
	exit 1
fi

# see if the user is trying to merge a branch into master
branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ $2 == 'merge' ]]; then
	echo "merging branch"
	if [[ "$branch" == "master" ]]; then
		echo "  trying to merge into the 'master' branch"
		echo "  you should push the local branch to GitHub"
		echo "  and merge to master using a pull request"
		echo
		exit 1
	fi
fi

# see if the user is trying to commit to the master branch
if [ "$branch" = "master" ]; then
	read -p "  You are about to commit to the master branch, are you sure? [y|n] " -n 1 -r < /dev/tty
	echo
	if echo $REPLY | grep -E '^[Yy]$' > /dev/null
	then
		exit 0 # commit will execute
	fi
	exit 1 # commit will not execute
fi

# is the current branch a direct child of the master branch?
# echo "checking parent branch"
# PARENT=$(git show-branch -a | grep -v `git rev-parse --abbrev-ref HEAD` | grep -v origin | sed 's/.*\[\(.*\)\].*/\1/' | grep -v -e '^$' | grep -v "^----$"
# echo "parent branch is $PARENT")

# see if the user is trying to commit to the master branch
# echo "  you are trying to commit to the '$branch' branch"
# if [ "$branch" = "master" ]; then
#   echo "    you can't commit directly to the master branch"
#   echo "    create a local feature branch first"
#   echo
#   exit 1
# fi

# check for valid branch name:

# valid_branch_regex="^iss\d{3}\/[a-z\-]+$"

# if [[ ! $local_branch =~ $valid_branch_regex ]]
# then
#     echo "invalid branch name"
#     echo "  format is: 'iss000/issue-name'"
#     echo "  replacing '000' with the issue number and 'issue-name' with the issue name"
#     echo "  only lower-case letters and replace spaces in the issue name with dashes"
#     echo "  rename your branch and try again"
#     exit 1
# fi

./node_modules/.bin/eslint .

echo "  commit successful..."
