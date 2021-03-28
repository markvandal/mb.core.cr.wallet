import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import * as Analytics from 'expo-firebase-analytics'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { authActions, spinnerActions } from '../../store'
import { Error } from '../error'

import { styles } from '../styles/main';


export const Request = connect(
  ({ auth: { newAuth, loading }, errors }, ownProps) => ({
    auth: newAuth,
    loading,
    errors,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    startLoading: () => dispatch(spinnerActions.startLoading()),
    endLoading: () => dispatch(spinnerActions.endLoading()),
    request: async (identity) => {
      Analytics.logEvent('auth.request.try')
      const res = dispatch(authActions.request(identity))
      if (!res.error) {
        Analytics.logEvent('auth.request.success')
      }
    },
    ...ownProps
  })
)(withGalio(({ auth, request, loading, startLoading, endLoading, styles }) => {
  let identity = null

  useEffect(() => {
    if (loading) startLoading()
    else endLoading()
  })

  return <Block flex center space="around">
    <Block style={styles.list_block_main}>
      <Text style={styles.list_block_title}>Предложить аутентификацию</Text>
      <Block style={styles.list_block_item}>
        <Input placeholder="Введите номер паспорта"
          style={styles.content_input}
          onRef={_ => identity = _} />
      </Block>
      <Block style={styles.list_block_item_content}>
        <Error />
      </Block>
      <Button round size="large" style={styles.list_block_item_button}
        onPress={() => request(identity.value)}>Выслать</Button>
      {
        auth
          ?
          <Block card row middle style={styles.list_block_item_header}>
            <Text style={styles.list_block_item_caption}>{auth.authId}</Text>
            <Text style={styles.list_block_item_info}>{auth.key}</Text>
          </Block>
          : null
      }
    </Block>
  </Block>
}, styles))