import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Context } from '../context'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { walletActions } from '../store'


export const Main = connect(
  ({ wallet }, ownProps) => ({ ...ownProps, mnemonic: wallet.mnemonic }),
  (dispatch, ownProps) => ({
    signOut: _ => dispatch(walletActions.signOut()),
    ...ownProps,
  })
)(withGalio(({ navigation, mnemonic, signOut }) => {
  const [name] = mnemonic ? mnemonic.split(' ') : [null]
  const context = useContext(Context)

  return <Block>
    <Text>....</Text>
    <Text>....</Text>
    {
      mnemonic
        ? <Block>
          <Text>{name}</Text>
          <Button onPress={signOut}>Sign Out</Button>
          <Button onPress={() => navigation.navigate('invite.create')}>Invite</Button>
        </Block>
        : <Button round uppercase onPress={() => navigation.navigate('auth')}>Auth</Button>
    }
    {
      context.config.DEBUG_AUTH
        ? <Button round uppercase onPress={() => navigation.navigate('tests')}>Tests</Button>
        : null
    }
  </Block>
}))