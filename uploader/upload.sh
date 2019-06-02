#!/bin/bash

# Only MacOS is supported now.
if [[ !"$OSTYPE" == "darwin"* ]]; then
    echo "Unsupported system."
    exit -1
fi
OS="macos"

echo "Uploading..."

# TODO: Upload $HISTFILE to gs://command-search/histfiles/

# TODO: Write meta entry {os, username, system_id, timestamp, gs filepath} to db
