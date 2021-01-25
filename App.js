// import './shim.js'
import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { Provider } from 'react-redux'

import { GalioProvider } from 'galio-framework'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { store } from './store'
import { WalletAuth } from './components/wallet/auth'
import { Main } from './components/main'
import { TestMain } from './components/tests/main'
import { Create as InviteCreate } from './components/invite/create'
import { Level as InviteLevel } from './components/invite/level'
import { Type as InviteType } from './components/invite/type'


const { Navigator, Screen } = createStackNavigator()

const App = () =>
  <Provider store={store}>
    <GalioProvider>
      <NavigationContainer>
        <Navigator headerMode="none" initialRouteName="main">
          <Screen name="main" component={Main} />
          <Screen name="auth" component={WalletAuth} />
          <Screen name="tests" component={TestMain} />
          <Screen name="invite.create" component={InviteCreate} />
          <Screen name="invite.level" component={InviteLevel} />
          <Screen name="invite.type" component={InviteType} />
        </Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GalioProvider>
  </Provider>

export default App