import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { inviteActions, walletActions } from '../../store'
import { Context } from '../../context'
import { alertError } from '../error'


export const Accept = connect(
  ({ invite: { newAccount } }, ownProps) =>
    ({ ...ownProps, newAccount }),
  (dispatch, ownProps) => ({
    accept: async (navigation, sequence) => {
      const res = await dispatch(inviteActions.accept(sequence))
      if (res.error) {
        alertError(res.error.message)
      } else {        
        const mnemonic = res.payload?.newAccount?.mnemonic
        if (mnemonic) {
          await dispatch(walletActions.openWithMnemoic(mnemonic))
          navigation.setParams({})
        }
      }
    },
    ...ownProps,
  }),
)(withGalio(({ navigation, newAccount, accept, theme }) => {
  let sequence = ''

  return <Block>
    {
      newAccount
        ? <Block>
          <Text>IdentityId: {newAccount.identityId}</Text>
          <Text>Mnemonic (password): {newAccount.mnemonic}</Text>
          <Button
            onlyIcon
            icon="sharealt"
            iconFamily="antdesign"
            iconSize={20}
            color="primary"
            iconColor={theme.COLORS.WHITE}
            onPress={async () => {
              try {
                await Share.share(
                  {
                    title: 'Meta-Belarus Identity',
                    message: `${newAccount.mnemonic}`,
                  }
                )
              } catch (_) {
                Clipboard.setString(`${newAccount.mnemonic}`)
              }
            }}
          />
          <Button onPress={() => navigation.navigate('record.personal.list')}>Proceed to passport</Button>
        </Block>
        : <Block>
          <Text>Input invite code</Text>
          <Input onRef={_ => sequence = _} />
          <Button onPress={() => accept(navigation, sequence.value)}>Create ID</Button>
        </Block>
    }
  </Block>
}))


