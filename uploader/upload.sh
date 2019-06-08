#!/bin/bash

# We only support MacOS now.
if [[ !"$OSTYPE" == "darwin"* ]]; then
    echo "Unsupported system."
    exit -1
fi

OS="macos"
SYSTEM_ID=`ioreg -d2 -c IOPlatformExpertDevice | awk -F\" '/IOPlatformUUID/{print $(NF-1)}'`

curl -X POST \
    -F "data=@$HISTFILE" \
    -F os=$OS \
    -F username=$USER \
    -F system_id=$SYSTEM_ID \
    -F shell=$SHELL \
    http://localhost:3000/histfile_upload
echo "Done"
