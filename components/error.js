import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Alert } from 'react-native'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { errorsActions } from '../store'
import { styles } from './styles/main'


export const Error = connect(
  ({ errors }) => ({
    errors
  }),
  (dispatch, ownProps) => ({
    close: () => dispatch(errorsActions.reset())
  })
)(withGalio(
  ({ errors, close, theme, styles, hideBlock }) => {
    return hideBlock ? null : <Block card flex row style={styles.error_block}>
      {
        errors.error
          ? <Fragment>
            <Text style={styles.error_block_text}>{errors.error.error.message}</Text>
            <Button
              onlyIcon
              icon="close"
              iconFamily="antdesign"
              iconSize={theme.SIZES.ICON}
              iconColor={theme.COLORS.WHITE}
              onPress={close}
              style={styles.error_block_close}
            />
          </Fragment>
          : null
      }
    </Block>
  }, styles))


export const alertError = (message) => {
  if (window?.alert) {
    alert(message)
  } else {
    Alert.alert(
      'Error occured',
      message,
      [
        { text: 'OK' }
      ]
    )
  }
}