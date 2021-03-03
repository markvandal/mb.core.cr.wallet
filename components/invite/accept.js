import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { inviteActions, walletActions } from '../../store'
import { Context } from '../../context'
import { alertError } from '../error'
import { styles } from '../styles/main'
import css from "react-native-web/dist/exports/StyleSheet/css";


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
)(withGalio(({ navigation, newAccount, accept, theme, styles }) => {
  let sequence = ''

  return <Block middle flex>
    {
      newAccount
        ? <Block>
          <Text style={styles.list_block_title} >IdentityId: {newAccount.identityId}</Text>
          <Text style={styles.list_block_item_label} >Mnemonic (password): {newAccount.mnemonic}</Text>
          <Button
            onlyIcon
            icon="sharealt"
            iconFamily="antdesign"
            iconSize={theme.SIZES.SMALL_ICON}
            size="large"
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
          <Button round size="large" style={styles.content_button_alone} onPress={() => navigation.navigate('record.personal.standard')}>Перейти к пасспорту</Button>
        </Block>
        : <Block>
          <Text style={styles.list_block_item_label_value} >Введите код приглашения</Text>
          <Input styles={styles.conent_input}
                 onRef={_ => sequence = _} />
          <Button round size="large" style={styles.content_button_alone} onPress={() => accept(navigation, sequence.value)}>Создать пасспорт</Button>
        </Block>
    }
  </Block>
}, styles))


