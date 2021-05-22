import React, { useContext, useEffect } from 'react'
import { Linking } from 'react-native'
import { connect } from 'react-redux'
import { Context } from '../../context'
import * as Analytics from 'expo-firebase-analytics'
import { fromBase64 } from '@cosmjs/encoding'
import { sign } from '../../utils'

import { withGalio, Block, Button, Input, Text } from 'galio-framework'
import { Error } from '../error'
import { styles } from '../styles/main';

import { list as listRecords } from '../record/helper'
import { walletActions, spinnerActions, errorsActions } from '../../store'


export const Client = connect(
  ({
    wallet: { address, identity, loading, errors },
    record: { records },
  }, ownProps) => ({
    loading,
    address,
    identity,
    errors,
    records,
    ...ownProps,
  }),
  (dispatch, ownProps) => ({
    startLoading: () => dispatch(spinnerActions.startLoading()),
    endLoading: () => dispatch(spinnerActions.endLoading()),
    listRecords: listRecords(dispatch),
    auth: async (params, records, backUrl, context) => {
      Analytics.logEvent('client.sign.try')
      if (params.toSign && backUrl) {
        const signature = await sign(context.wallet, params.toSign)
        const url = new URL(backUrl)
        url.searchParams.set('metaId', params.metaId)
        url.searchParams.set('toSign', params.toSign)
        url.searchParams.set('signed', signature)
        if (params.record) {
          params.record.map(
            key => url.searchParams.set(
              key, records.find(record => record.key === key)?.data || ''
            )
          )
        }
        const toUrl = url.toString()

        if (await Linking.canOpenURL(toUrl)) {
          Linking.openURL(toUrl)
        } else {
          window.location.href = toUrl
        }
      } else {
        Analytics.logEvent('client.sign.error.nothing')
        await errorsActions.produce(new Error('Сервис не предложил строку для подписи'))
      }
    },
    connect: async (mnemonic) => {
      Analytics.logEvent('client.auth.try')
      const res = await dispatch(walletActions.openWithMnemoic(mnemonic))
      if (!res.error) {
        Analytics.logEvent('client.auth.success')
      }
    },
    ...ownProps,
  }),
)(withGalio(({
  route, listRecords, connect, auth, loading, startLoading, endLoading,
  address, identity, records, theme, styles
}) => {
  const context = useContext(Context)
  let mnemonic = null
  let backUrl = Buffer.from(fromBase64(route.params.backUrl)).toString()

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
    <Block middle flex>
      <Text style={styles.list_block_title}>Запрос от: {backUrl}</Text>
    </Block>
    {
      identity && (identity.id === route.params.metaId)
        ? <Block flex center>
          <Button round size="large" style={styles.content_button}
            onPress={() => auth(route.params, records, backUrl, context)}>Подтвердить</Button>
          <Block style={styles.list_block_item_content}>
            <Error />
          </Block>
          <Block flex style={styles.list_block_main}>
            <Text style={styles.list_block_title}>Запрашиваемые данные</Text>
            {
              route.params.record.map(
                key => {
                  const record = records.find(record => record.key === key) || key

                  return typeof record === 'string'
                  ? <Block key={key} card flex style={styles.list_block_card}><Text>Record ID: {key}</Text></Block>
                  : <Block key={record.id} card flex style={styles.list_block_card}>
                    <Block card borderless row middle style={styles.list_block_item_header}>
                      <Text style={styles.list_block_item_caption}>{`#${record.id} ${record.key}`}</Text>
                      <Text style={styles.list_block_item_info}>{record.recordType}</Text>
                    </Block>
                    <Block row middle style={styles.list_block_item_content}>
                      <Text style={styles.app_text}>{record.data}</Text>
                    </Block>
                    <Block row middle style={styles.list_block_item_header}>
                      <Text style={styles.list_block_item_label_value}>Подпись:</Text>
                    </Block>
                    <Block style={styles.list_block_item_content}>
                      <Text style={styles.app_info}>{record.signature}</Text>
                    </Block>
                  </Block>
                }
              )
            }
          </Block>
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
            onPress={() => connect(mnemonic.value)}>Представиться</Button>
        </Block>
    }

  </Block>
}, styles))