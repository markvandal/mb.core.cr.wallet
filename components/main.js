import React from 'react'
import { connect } from 'react-redux'

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

  return <Block>
    {
      mnemonic
        ? <Block>
          <Text>{name}</Text>
          <Button onPress={signOut}>Sign Out</Button>
        </Block>
        : <Button round uppercase onPress={() => navigation.navigate('auth')}>Auth</Button>
    }
    <Button round uppercase onPress={() => navigation.navigate('tests')}>Tests</Button>
  </Block>
}))