
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

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { store } from './store'
import { WalletAuth } from './components/wallet/auth'
import { Main } from './components/main'
import { TestMain } from './components/tests/main'


const { Navigator, Screen } = createStackNavigator()

const App = () =>
  <Provider store={store}>
    <GalioProvider>
      <NavigationContainer>
        <Navigator headerMode="none" initialRouteName="main">
          <Screen name="main" component={Main} />
          <Screen name="auth" component={WalletAuth} />
          <Screen name="tests" component={TestMain} />
        </Navigator>
      </NavigationContainer>
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
