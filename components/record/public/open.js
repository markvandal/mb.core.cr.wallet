import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Card } from 'galio-framework'

import { Context } from '../../context'
import { authActions } from '../../store'
import { decrypt } from '../../utils/ledger/crypt'


export const PublicOpen = connect(
  (state, ownProps) => ({
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    ...ownProps
  })
)(withGalio(({ navigation, theme }) => {
  const identity = null

  return <Block>
    <Input color={theme.COLORS.THEME}
      style={{ borderColor: theme.COLORS.THEME }}
      onRef={_ => identity = _} />
    <Button round uppercase onPress={_ => _}>Open</Button>
  </Block>
}))