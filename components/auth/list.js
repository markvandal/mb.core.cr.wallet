import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Card } from 'galio-framework'

import { Context } from '../../context'
import { authActions } from '../../store'
import { decrypt } from '../../utils/ledger/crypt'


export const List = connect(
  ({ auth: { list }, wallet: { identity } }, ownProps) =>
    ({ auth: list, identity, ...ownProps }),
  (dispatch, ownProps) => ({
    list: () => dispatch(authActions.list()),
    load: (auth) => auth.map(
      (service, idx) => {
        if ('string' === typeof service) {
          dispatch(authActions.load(idx))
        }
      }
    ),
    sign: idx => dispatch(authActions.sign(idx)),
    ...ownProps,
  }),
)(withGalio(({ navigation, auth, identity, list, load, sign, theme }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))
  useEffect(useCallback(_ => { load(auth) }, [auth]))

  return <Block>
    {
      auth.map(
        (auth, idx) => 'string' === typeof auth
          ? <Card key={auth}><Text>Auth: {auth}</Text></Card>
          : (() => {
            const sessionToken = decrypt(context.wallet, auth.key)

            return <Card flex
              key={auth.service}
              title={`Service ID: ${auth.service}`}
              caption={`Status: ${auth.status}`}>
              <Text>Key: {auth.key}</Text>
              <Text>Decrypted: {sessionToken}</Text>
              {
                (() => {
                  switch (auth.status) {
                    case 'AUTH_OPEN':
                      return <Button
                        onlyIcon
                        icon="pencil"
                        iconFamily="entypo"
                        iconSize={20}
                        color="primary"
                        iconColor={theme.COLORS.WHITE}
                        onPress={() => sign(idx)}
                      />
                      case 'AUTH_SIGNED':
                        return <Button
                        onlyIcon
                        icon="sharealt"
                        iconFamily="antdesign"
                        iconSize={20}
                        color="primary"
                        iconColor={theme.COLORS.WHITE}
                        onPress={() => Clipboard.setString(`${sessionToken}`)}
                      />
                  }
                })()
              }
            </Card>
          })()
      )
    }
    {
      identity.identityType === 'SERVICE'
        ? <Button round uppercase onPress={() => navigation.navigate('auth.request')}>Request Auth</Button>
        : null
    }
  </Block>
}))