import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { inviteActions } from '../../store'
import { Context } from '../../context'


export const Accept = connect(
  ({ invite: { newAccount } }, ownProps) =>
    ({ ...ownProps, newAccount }),
  (dispatch, ownProps) => ({
    accept: (sequence) => dispatch(inviteActions.accept(sequence)),
    ...ownProps,
  }),
)(withGalio(({ newAccount, accept, theme }) => {
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
        </Block>
        : <Block>
          <Text>Input invite code</Text>
          <Input onRef={_ => sequence = _} />
          <Button onPress={() => accept(sequence.value)}>Create ID</Button>
        </Block>
    }
  </Block>
}))


