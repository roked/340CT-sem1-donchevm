#!/bin/bash

set -e

echo "POST-CHECKOUT"

prevHEAD=$1
newHEAD=$2
checkoutType=$3

[[ $checkoutType == 1 ]] && checkoutType='branch' || checkoutType='file' ;

echo "  Checkout type: $checkoutType"
echo "  prev HEAD: "`git name-rev --name-only $prevHEAD`
echo "  new  HEAD: "`git name-rev --name-only $newHEAD`

# this is a file checkout – do nothing
if [ "$3" == "0" ]; then exit; fi

BRANCH_NAME=$(git symbolic-ref --short -q HEAD)
NUM_CHECKOUTS=`git reflog --date=local | grep -o ${BRANCH_NAME} | wc -l`

#if the refs of the previous and new heads are the same 
#AND the number of checkouts equals one, a new branch has been created
if [ "$1" == "$2"  ] && [ ${NUM_CHECKOUTS} -eq 1 ]; then
    echo "  new branch '$BRANCH_NAME' created"
fi
echo
