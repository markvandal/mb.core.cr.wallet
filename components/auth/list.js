import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'

import { authActions } from '../../store'


export const List = connect(
  ({ auth }, ownProps) =>
    ({ ...ownProps, auth }),
  (dispatch, ownProps) => ({
    ...ownProps,
    list: () => dispatch(authActions.list()),
    load: (auth) => auth.map(
      (service, idx) => 'string' === typeof service && dispatch(authActions.load(idx))
    )
  }),
)(withGalio(({ navigation, auth, list, load, theme }) => {
  useFocusEffect(useCallback(() => { list() }, []))
  useEffect(useCallback(_ => { load(auth) }, [auth]))
  return <Block>
  </Block>
}))