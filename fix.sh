#!/bin/bash

echo 'Fixing PropTypes issues'

if grep -q "export const ViewPropTypes = { style: null };" ./node_modules/react-native-web/dist/index.js; then
    echo "ViewPropTypes fixed already!"
else
    echo "export const ViewPropTypes = { style: null };">> ./node_modules/react-native-web/dist/index.js
fi

#if grep -q "\"expo-random\"" ./node_modules/@cosmjs/crypto/build/random.js; then
#    echo "Crypto is already schemed"
#else
#    sed -i -e 's/\"crypto\"/\"expo-random\"/g' ./node_modules/@cosmjs/crypto/build/random.js
#fi

