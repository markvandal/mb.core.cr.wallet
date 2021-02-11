import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { Provider } from 'react-redux'

import { GalioProvider, NavBar } from 'galio-framework'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { store } from './store'
import { WalletAuth } from './components/wallet/auth'
import { Main } from './components/main'
import { TestMain } from './components/tests/main'
import { Create as InviteCreate } from './components/invite/create'
import { Accept as InviteAccept } from './components/invite/accept'
import { Level as InviteLevel } from './components/invite/level'
import { Type as InviteType } from './components/invite/type'
import { List as AuthList } from './components/auth/list'
import { PersonalList as RecordPersonalList } from './components/record/personal/list'
import { PublicList as RecordPublicList } from './components/record/public/list'
import { PublicOpen as RecordPublicOpen } from './components/record/public/open'
import { Create as RecordCreate } from './components/record/create'
import { Request as AuthRequest } from './components/auth/request'
import { Publicity as RecordPublicity } from './components/record/publicity'
import { Type as RecordType } from './components/record/type'


const { Navigator, Screen } = createStackNavigator()

const App = () =>
  <Provider store={store}>
    <GalioProvider>
      <NavigationContainer>
        <Navigator initialRouteName="main"
          screenOptions={_ => ({
            title: 'Meta-Belarus',
            header: ({ scene, navigation }) => {
              const { options } = scene.descriptor;

              return <NavBar 
                title={options.title}
                back={scene.route.name !== "main"}
                onLeftPress={() => navigation.goBack()} />
            }
          })}
        >
          <Screen name="main" component={Main} />
          <Screen name="auth" component={WalletAuth} />
          <Screen name="tests" component={TestMain} />
          <Screen name="invite.create" component={InviteCreate} />
          <Screen name="invite.accept" component={InviteAccept} />
          <Screen name="invite.level" component={InviteLevel} />
          <Screen name="invite.type" component={InviteType} />
          <Screen name="auth.list" component={AuthList} />
          <Screen name="auth.request" component={AuthRequest} />
          <Screen name="record.personal.list" component={RecordPersonalList} />
          <Screen name="record.public.list" component={RecordPublicList} />
          <Screen name="record.public.open" component={RecordPublicOpen} />
          <Screen name="record.create" component={RecordCreate} />
          <Screen name="record.publicity" component={RecordPublicity} />
          <Screen name="record.type" component={RecordType} />
        </Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </GalioProvider>
  </Provider>

export default App