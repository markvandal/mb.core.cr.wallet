import React from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'
import * as Analytics from 'expo-firebase-analytics'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { Error } from '../error'
import { styles } from '../styles/main'

import { inviteActions, walletActions } from '../../store'


export const Accept = connect(
  ({ invite: { newAccount, loading } }, ownProps) =>
    ({ newAccount, loading, ...ownProps }),
  (dispatch, ownProps) => ({
    accept: async (navigation, sequence) => {
      Analytics.logEvent('invite.accept.try')
      const res = await dispatch(inviteActions.accept(sequence))
      if (!res.error) {
        const mnemonic = res.payload?.newAccount?.mnemonic
        if (mnemonic) {
          const res = await dispatch(walletActions.openWithMnemoic(mnemonic))
          if (!res.error) {
            Analytics.logEvent('invite.accept.success')
            navigation.setParams({})
          }
        }
      }
    },
    ...ownProps,
  }),
)(withGalio(({ navigation, newAccount, accept, loading, styles, theme }) => {
  let sequence = ''

  return <Block middle flex>
    {
      newAccount
        ? <Block style={styles.list_block_main}>
          <Text style={styles.list_block_title}>Приглашение Принято</Text>
          <Block row middle style={styles.list_block_item_content}>
            <Text>IdentityId: { newAccount.identityId}</Text>
          </Block>
          <Block row middle style={styles.list_block_item_content}>
            <Text style={styles.app_text}>Mnemonic (password): {newAccount.mnemonic}</Text>
            <Button
              onlyIcon
              icon="sharealt"
              iconFamily="antdesign"
              iconSize={theme.SIZES.ICON}
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
          <Button round size="large" style={styles.list_block_item_button}
            onPress={() => navigation.navigate('record.personal.standard')}>Открыть паспорт</Button>
        </Block>
        : <Block style={styles.list_block_main}>
          <Text style={styles.list_block_title}>Введите код приглашения</Text>
          <Block style={styles.list_block_item}>
            <Input placeholder="Код приглашения"
              style={styles.content_input} onRef={_ => sequence = _} />
          </Block>

          <Block style={styles.list_block_item_content}>
            <Error />
          </Block>
          <Button round size="large" style={styles.list_block_item_button} loading={loading}
            onPress={() => accept(navigation, sequence.value)}>Создать паспорт</Button>
        </Block>
    }
  </Block>
}, styles))