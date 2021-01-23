
import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { Provider } from 'react-redux'

import { StyleSheet } from 'react-native';
import { 
  theme, 
  withGalio, 
  GalioProvider, 
  Block, 
  Text, 
} from 'galio-framework'

import { store } from './store'
import { WalletAuth } from './components/wallet/auth'


const App = () =>
  <Provider store={store}>
    <GalioProvider>
      <Block>
        <Text>Open up App.js to start working on your app!</Text>
        <WalletAuth />
      </Block>
      <StatusBar style="auto" />
    </GalioProvider>
  </Provider>

export default withGalio(App, styles)

const styles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.FACEBOOK
  }
});
