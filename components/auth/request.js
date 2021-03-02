import React from 'react'
import { connect } from 'react-redux'

import { withGalio, Block, Button, Text, Card, Input } from 'galio-framework'
import { authActions } from '../../store'

import { styles } from '../styles/main';


export const Request = connect(
  ({ auth: { newAuth } }, ownProps) => ({ auth: newAuth, ...ownProps }),
  (dispatch, ownProps) => ({
    request: (identity) => dispatch(authActions.request(identity)),
    ...ownProps
  })
)(withGalio(({ auth, request, theme, styles }) => {
  let identity = null

  return <Block>
    <Input color={theme.COLORS.THEME}
      style={{ borderColor: theme.COLORS.THEME }}
      onRef={_ => identity = _} />
    {
      auth
        ? <Card>
          <Text>Id: {auth.authId}</Text>
          <Text>Key: {auth.key}</Text>
        </Card>
        : null
    }
    <Button round size="large" style={styles.content_button} 
      onPress={() => request(identity.value)}>Request</Button>
  </Block>
}, styles))