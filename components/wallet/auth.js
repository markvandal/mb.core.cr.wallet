import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Context } from '../../context'

import { 
  withGalio, 
  Block, 
  Button,
  Input 
} from 'galio-framework'

import { walletActions, inviteActions } from '../../store'


export const WalletAuth = connect(
  (_, ownProps) => ({ ...ownProps }),
  (dispatch, ownProps) => ({
    connect: mnemonic => dispatch(walletActions.openWithMnemoic(mnemonic)),
    createInvite: (type, level) => dispatch(inviteActions.create({level, type})),
    ...ownProps
  })
)(withGalio(({ navigation, connect, createInvite, theme }) => {
  const context = useContext(Context)
  let mnemonic = null

  return <Block>
    <Input color={theme.COLORS.THEME} 
          icon="heart"
          family="antdesign"
          iconSize={14}
          iconColor="red" 
          style={{ borderColor: theme.COLORS.THEME }}
          onRef={_ => mnemonic = _} />
    {
      context.config.DEBUG_AUTH 
        ? <Button round uppercase onPress={() => mnemonic.value = context.config.DEBUG_AUTH}>Fill default</Button>
        : null
    }
    <Button round uppercase onPress={() => connect(mnemonic.value)}>Connect</Button>
    <Button round uppercase onPress={() => createInvite(3, 2)}>Invite</Button>
    <Button round uppercase onPress={() => navigation.navigate('tests')}>Tests</Button>
  </Block>
}))