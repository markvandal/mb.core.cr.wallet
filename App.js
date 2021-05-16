import React, { useRef } from 'react'
import { StatusBar } from 'expo-status-bar'

import { Provider } from 'react-redux'
import * as Analytics from 'expo-firebase-analytics'

import { GalioProvider } from 'galio-framework'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import AppLoading from 'expo-app-loading';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { customTheme } from './components/styles/theme'

import { store } from './store'

import { Header } from './components/header'
import { WalletAuth } from './components/wallet/auth'
import { Main } from './components/main'
import { TestMain } from './components/tests/main'
import { Create as InviteCreate } from './components/invite/create'
import { Accept as InviteAccept } from './components/invite/accept'
import { Level as InviteLevel } from './components/invite/level'
import { Type as InviteType } from './components/invite/type'
import { List as AuthList } from './components/auth/list'
import { PersonalList as RecordPersonalList } from './components/record/personal/list'
import { StandardList as RecordStandardList } from './components/record/personal/standard'
import { PublicList as RecordPublicList } from './components/record/public/list'
import { PublicOpen as RecordPublicOpen } from './components/record/public/open'
import { Create as RecordCreate } from './components/record/create'
import { Request as AuthRequest } from './components/auth/request'
import { Publicity as RecordPublicity } from './components/record/publicity'
import { Type as RecordType } from './components/record/type'
import { Loading } from './components/spinner'

const { Navigator, Screen } = createStackNavigator()

const App = () => {
  const [fontsLoaded] = useFonts({ regular: Roboto_400Regular, bold: Roboto_700Bold })
  const navigationRef = useRef()
  const routeNameRef = useRef()

  if (!fontsLoaded) {
    return <AppLoading />
  }

  return <Provider store={store}>
    <Loading />
    <GalioProvider theme={customTheme}>
      
      <NavigationContainer ref={navigationRef} 
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: customTheme.COLORS.WHITE,
          }
        }}
        linking={{}}
        onReady={() =>
          (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
        }
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            await Analytics.setCurrentScreen(currentRouteName)
            Analytics.logEvent(`navigate.${currentRouteName}`)
          }

          routeNameRef.current = currentRouteName;
        }}>
        <Navigator initialRouteName="main"
          screenOptions={_ => ({
            title: `Meta-Belarus ID${store.getState().wallet?.identity?.id
              ? `#${store.getState().wallet.identity.id}`
              : ''
              }`,
            header: props => <Header {...props} />
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
          <Screen name="record.personal.standard" component={RecordStandardList} />
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
}

export default App