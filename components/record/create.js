import React, { useContext } from 'react'

import { connect } from 'react-redux'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { alertError } from '../error'

import { recordActions } from '../../store'
import { Context } from '../../context'
import { styles } from '../styles/main'


export const Create = connect(
  ({ record: { newRecord: createUI } }, ownProps) => ({
    createUI,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    create: async (navigation, record) => {
      const res = await dispatch(recordActions.create(record))
      if (res.error) {
        alertError(res.error.message)
      } else {
        navigation.goBack()
      }
    },
    switchPublicity: level => dispatch(recordActions.switchPublicity(level)),
    switchType: type => dispatch(recordActions.switchType(type)),
    ...ownProps
  })
)(withGalio(({ navigation, route, create, switchPublicity, switchType, createUI, styles }) => {
  const context = useContext(Context)
  const identity = route.params?.identity
  let key = null
  let data = null

  return <Block flex center space="around">
    <Block style={styles.list_block_main}>
      {
        identity
          ? <Text style={styles.list_block_title}>Создать запись для паспорта ID ${identity}</Text>
          : <Text style={styles.list_block_title}>Создать запись в своём паспорте</Text>
      }
      <Block style={styles.list_block_item}>
        <Input placeholder="Код записи" style={styles.content_input} onRef={_ => key = _} />
        <Input placeholder="Значение записи" style={styles.content_input} onRef={_ => data = _} />
      </Block>
      <Button round size="large" style={styles.list_block_item_button}
        onPress={() => {
          context.selectFunction = (type, nav) => {
            switchType(type)
            nav.goBack()
          }
          navigation.navigate('record.type', { current: createUI.type })
        }}>{`Тип: ${createUI.type || 'Default'}`}</Button>
      <Button round size="large" style={styles.list_block_item_button}
        onPress={() => {
          context.selectFunction = (type, nav) => {
            switchPublicity(type)
            nav.goBack()
          }
          navigation.navigate('record.publicity', { current: createUI.publicity })
        }}>{`Публичность: ${createUI.publicity}`}</Button>
      <Button round size="large" style={styles.list_block_item_button}
        onPress={_ => create(navigation, {
          identity,
          key: key.value,
          data: data.value,
          type: createUI.type ? context.value(`RecordType.${createUI.type}`, 'crsign') : null,
          publicity: context.value(`PublicityType.${createUI.publicity}`, 'crsign'),
        })}>Создать запись</Button>
    </Block>
  </Block>
}, styles))