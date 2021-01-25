#!/bin/bash

echo 'Fixing JS for RN issues'

# if grep -q "export const ViewPropTypes = { style: null };" ./node_modules/react-native-web/dist/index.js; then
#     echo "ViewPropTypes fixed already!"
# else
#     echo "export const ViewPropTypes = { style: null };">> ./node_modules/react-native-web/dist/index.js
# fi

# if grep -q "\"expo-random\"" ./node_modules/@cosmjs/crypto/build/random.js; then
#     echo "Crypto is already schemed"
# else
#     sed -i -e 's/const crypto = require\(\"expo-random\"\)/\/\//g' ./node_modules/@cosmjs/crypto/build/random.js
#     sed -i '1s/\"use strict\";/\"use strict\";\nimport crypto from \"crypto\"\n/' ./node_modules/@cosmjs/crypto/build/random.js
# fi

if grep -q "react-native-sodium" ./node_modules/@cosmjs/crypto/build/libsodium.js; then 
    echo "Libsodium is already schemed"
else 
    sed -i -e 's/\"libsodium-wrappers\"/\"react-native-sodium\"/g' ./node_modules/@cosmjs/crypto/build/libsodium.js
fi

./node_modules/.bin/rn-nodeify --install crypto,buffer,events,process,stream,util,inherits,fs,path,assert --hack;