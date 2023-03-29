#!/bin/bash

# Prevent configure command being leaked in bash history
export HISTIGNORE='doppler*'

# Prompt user for doppler token
read -p "Enter the doppler token: " token

# Set y to current directory
dir=$(pwd)

# Set token with doppler configure command
echo "$token" | doppler configure set token --scope "$dir"
