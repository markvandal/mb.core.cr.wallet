import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Context } from '../../context'

import { withGalio, Block, Button, Input, Text } from 'galio-framework'
import { Error } from '../error'
import { walletActions } from '../../store'
import { styles } from '../styles/main'


export const WalletAuth = connect(
  ({ wallet: { loading } }, ownProps) => ({ loading, ...ownProps }),
  (dispatch, ownProps) => ({
    connect: async (mnemonic, nav) => {
      const res = await dispatch(walletActions.openWithMnemoic(mnemonic))
      if (!res.error) {
        nav.navigate('main')
      }
    },
    ...ownProps
  })
)(withGalio(({ navigation, connect, loading, theme, styles }) => {
  const context = useContext(Context)
  let mnemonic = null

  return <Block middle flex>
    <Text style={styles.list_block_title}>Аутентификация</Text>
    <Input color={theme.COLORS.THEME} icon="profile" password
      viewPass family="antdesign" iconSize={theme.SIZES.ICON}
      iconColor={theme.COLORS.THEME} style={styles.auth_input}
      multiline numberOfLines={5} onRef={_ => mnemonic = _} />
    {
      context.config.DEBUG_AUTH
        ? <Button round size="large" style={styles.content_button}
          onPress={() => mnemonic.value = context.config.DEBUG_AUTH}>Fill default</Button>
        : null
    }
    <Block style={styles.list_block_item_content}>
      <Error />
    </Block>
    <Button round size="large" style={styles.content_button} loading={loading}
      onPress={() => connect(mnemonic.value, navigation)}>Представиться</Button>
  </Block>
}, styles))