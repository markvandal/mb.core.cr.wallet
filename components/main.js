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
    {
      mnemonic
        ? <Block>
          <Text>{name}</Text>
          <Button onPress={signOut}>Sign Out</Button>
          <Button onPress={() => navigation.navigate('invite.create')}>Invite</Button>
          <Button onPress={() => navigation.navigate('auth.list')}>Services</Button>
          <Button onPress={() => navigation.navigate('record.personal.list')}>ID Records</Button>
        </Block>
        : <Block>
          <Button round uppercase onPress={() => navigation.navigate('auth')}>Auth</Button>
          <Button round uppercase onPress={() => navigation.navigate('invite.accept')}>Create ID</Button>
        </Block>
    }
    {
      context.config.DEBUG_AUTH && mnemonic
        ? <Button round uppercase onPress={() => navigation.navigate('tests')}>Tests</Button>
        : null
    }
  </Block>
}))