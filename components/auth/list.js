import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Input, Card } from 'galio-framework'

import { Context } from '../../context'
import { authActions } from '../../store'
import { decrypt } from '../../utils/ledger/crypt'


export const List = connect(
  ({ auth }, ownProps) =>
    ({ ...ownProps, auth: auth.list }),
  (dispatch, ownProps) => ({
    ...ownProps,
    list: () => dispatch(authActions.list()),
    load: (auth) => auth.map(
      (service, idx) => {
        if ('string' === typeof service) {
          dispatch(authActions.load(idx))
        }
      }
    )
  }),
)(withGalio(({ navigation, auth, list, load, theme }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))
  useEffect(useCallback(_ => { load(auth) }, [auth]))
  return <Block>
    {
      auth.map(
        auth => 'string' === typeof auth
          ? <Card key={auth}><Text>Auth: {auth}</Text></Card>
          : <Card key={auth.service} flex title={`Service ID: ${auth.service}`}>
            <Text>Key: {auth.key}</Text>
            <Text>Decrypted: {decrypt(context.wallet, auth.key)}</Text>
          </Card>
      )
    }
  </Block>
}))