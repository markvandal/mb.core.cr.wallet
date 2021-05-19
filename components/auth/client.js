import React, { useContext, useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { Context } from '../../context'
import * as Analytics from 'expo-firebase-analytics'

import { withGalio, Block, Button, Input, Text } from 'galio-framework'
import { Error } from '../error'
import { styles } from '../styles/main';

import { list as listRecords } from '../record/helper'
import { walletActions, spinnerActions } from '../../store'


export const Client = connect(
  ({
    wallet: { address, identity, loading },
    record: { records },
  }, ownProps) => ({
    loading,
    address,
    identity,
    records,
    ...ownProps,
  }),
  (dispatch, ownProps) => ({
    startLoading: () => dispatch(spinnerActions.startLoading()),
    endLoading: () => dispatch(spinnerActions.endLoading()),
    listRecords: listRecords(dispatch),
    connect: async (mnemonic, nav) => {
      Analytics.logEvent('wallet.auth.try')
      const res = await dispatch(walletActions.openWithMnemoic(mnemonic))
      if (!res.error) {
        Analytics.logEvent('wallet.auth.success')
        // nav.navigate('main')
      }
    },
    ...ownProps,
  }),
)(withGalio(({
  route, listRecords, connect, loading, startLoading, endLoading,
  address, navigation, identity, records, theme, styles
}) => {
  const context = useContext(Context)
  let mnemonic = null

  useEffect(() => {
    if (loading) startLoading()
    else endLoading()
  })

  useEffect(() => {
    if (address) {
      listRecords()
    }
  }, [address])

  return <Block space="around" flex>
    {
      identity && (identity.id === route.params.metaId)
        ? <Block middle flex>
          <Text>{address}</Text>
          {
            route.params.records.map(
              (val, key) => <Text key={key}>{val}</Text>
            )
          }
        </Block>
        : <Block middle flex>
          <Text style={styles.list_block_title}>Аутентификация для ID#: {route.params.metaId}</Text>
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
          <Button round size="large" style={styles.content_button}
            onPress={() => connect(mnemonic.value, navigation)}>Представиться</Button>
        </Block>
    }

  </Block>
}, styles))