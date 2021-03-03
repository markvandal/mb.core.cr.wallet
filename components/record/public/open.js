import React from 'react'
import { connect } from 'react-redux'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { styles } from '../../styles/main'


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
)(withGalio(({ navigation, open, styles }) => {
  let identity = null

  return <Block flex center space="around">
    <Block style={styles.list_block_main}>
      <Text style={styles.list_block_title}>Открыть чужой паспорт</Text>
      <Block style={styles.list_block_item}>
        <Input placeholder="Введите номер паспорта" onRef={_ => identity = _} />
      </Block>
      <Button round size="large" style={styles.list_block_item_button}
        onPress={_ => open(navigation, identity.value)}>Открыть</Button>
    </Block>
  </Block>
}, styles))