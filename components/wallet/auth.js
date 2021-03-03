import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Context } from '../../context'

import { withGalio, Block, Button, Input } from 'galio-framework'
import { walletActions } from '../../store'
import { styles } from '../styles/main'


export const WalletAuth = connect(
  (_, ownProps) => ({ ...ownProps }),
  (dispatch, ownProps) => ({
    connect: async (mnemonic, nav) => {
      await dispatch(walletActions.openWithMnemoic(mnemonic))
      nav.navigate('main')
    },
    ...ownProps
  })
)(withGalio(({ navigation, connect, theme, styles }) => {
  const context = useContext(Context)
  let mnemonic = null

  return <Block middle flex>
    <Input color={theme.COLORS.THEME}
      icon="profile"
      password
      viewPass
      family="antdesign"
      iconSize={theme.SIZES.ICON}
      iconColor={theme.COLORS.THEME}
      style={styles.auth_input}
      multiline
      numberOfLines={5}
      onRef={_ => mnemonic = _} />
    {
      context.config.DEBUG_AUTH
        ? <Button round size="large" style={styles.content_button}
          onPress={() => mnemonic.value = context.config.DEBUG_AUTH}>Fill default</Button>
        : null
    }
    <Button round size="large" style={styles.content_button}
      onPress={() => connect(mnemonic.value, navigation)}>Представиться</Button>
  </Block>
}, styles))