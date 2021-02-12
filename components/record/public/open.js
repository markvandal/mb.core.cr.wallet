import React from 'react'
import { connect } from 'react-redux'

import { withGalio, Block, Button, Input } from 'galio-framework'


export const PublicOpen = connect(
  (_, ownProps) => ({
    ...ownProps
  }),
  (_, ownProps) => ({
    open: (navigation, identityId) => {
      navigation.navigate('record.public.list', { identityId })
    },
    ...ownProps
  })
)(withGalio(({ navigation, open, theme }) => {
  let identity = null

  return <Block>
    <Input color={theme.COLORS.THEME}
      style={{ borderColor: theme.COLORS.THEME }}
      onRef={_ => identity = _} />
    <Button round uppercase onPress={_ => open(navigation, identity.value)}>Open</Button>
  </Block>
}))