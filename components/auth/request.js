import React from 'react'
import { connect } from 'react-redux'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { authActions } from '../../store'
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
    request: (identity) => dispatch(authActions.request(identity)),
    ...ownProps
  })
)(withGalio(({ auth, request, loading, styles }) => {
  let identity = null

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
        loading={loading} onPress={() => request(identity.value)}>Выслать</Button>
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