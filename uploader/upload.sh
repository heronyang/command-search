#!/bin/bash
# Run:
# $ export HISTFILE && bash upload.sh

# Only MacOS is supported now.
if [[ !"$OSTYPE" == "darwin"* ]]; then
    echo "Unsupported system."
    exit -1
fi
OS="macos"

echo "Uploading..."

# TODO: Upload $HISTFILE to gs://command-search/histfiles/TIMESTAMP
curl -X POST -F data=@$HISTFILE http://localhost:3000/histfile_upload
echo "Uploaded."

# TODO: Write meta entry {os, username, system_id, timestamp, gs filepath} to db
