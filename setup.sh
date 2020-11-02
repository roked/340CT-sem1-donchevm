#!/bin/bash

# SETUP SCRIPT
# run this script to install all the required tools and packages.

red=$(tput setaf 1)
green=$(tput setaf 2)
reset=$(tput sgr0)

echo
echo "=========== SETTING ${green}FILE PERMISSIONS${reset} ================"
chmod +x .githooks/*
chmod +x *.sh
git remote rm origin
echo "PS1='$ '" > "~/.profile"
echo
echo "============= DELETING ${green}TEMPORARY FILES${reset} =============="
rm -rf *.db  # delete any old database files
rm -rf package-lock.json
rm -rf .settings
rm -rf .sqlite_history
rm -rf .bash_history
rm -rf .git # delete the repository we have cloned (if any)
rm -rf public/names2.csv
echo
echo "============= INSTALLING ${green}DEBIAN${reset} TOOLS =============="
sudo apt update -y
sudo apt upgrade -y
sudo apt install -y psmisc lsof tree sqlite3 sqlite3-doc build-essential gcc g++ make ruby-dev
sudo snap install core
echo
echo "=============== INSTALLING ${green}HEROKU${reset} TOOL ================"
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
echo
echo "========= INSTALLING NODE USING ${green}NODESOURCE${reset} ========="
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
echo
echo "=========== INSTALLING THE ${green}NODE PACKAGES${reset} ==========="
echo
rm -rf node_modules
rm -rf package-lock.json
npm install
npm install --save-dev eslint ava # we WILL ensure these are installed!
npm audit fix
echo
echo "============== RUNNING THE ${green}UNIT TESTS${reset} =============="
#npm test
echo
echo "================ RUNNING THE ${green}LINTER${reset} ================"
npm run linter
echo
echo "===== CHECKING THE VERSION OF ${green}NODEJS${reset} INSTALLED ====="
node -v
echo
echo "====== INITIALISING THE ${green}REPOSITORY${reset} INSTALLED ======="
git init
echo
echo "================= ${green}SETUP COMPLETED ${reset} ================="