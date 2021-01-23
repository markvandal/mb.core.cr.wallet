import React, { useRef } from 'react'
import { connect } from 'react-redux'

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
)(withGalio(({ connect, createInvite, theme }) => {
  let mnemonic = null

  return <Block>
    <Input color={theme.COLORS.THEME} 
          icon="heart"
          family="antdesign"
          iconSize={14}
          iconColor="red" 
          style={{ borderColor: theme.COLORS.THEME }}
          onRef={_ => mnemonic = _} 
          value="egg glow dune pill paper child harsh craft churn blade measure access nerve upgrade large envelope warm donate awesome unaware culture surprise rally visa"/>
    <Button round uppercase onPress={() => connect(mnemonic.value)}>Connect</Button>
    <Button round uppercase onPress={() => createInvite('SERVICE', 'Level0')}>Invite</Button>
  </Block>
}))