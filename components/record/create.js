import React, { useContext, useCallback, useEffect } from 'react'

import { connect } from 'react-redux'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { alertError } from '../error'

import { recordActions, walletActions } from '../../store'
import { Context } from '../../context'


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
)(withGalio(({ navigation, route, create, switchPublicity, switchType, createUI }) => {
  const context = useContext(Context)
  const identity = route.params?.identity
  let key = null
  let data = null

  return <Block>
    {
      identity
        ? <Text>Create record for ID ${identity}</Text>
        : null
    }
    <Input placeholder="Key" onRef={_ => key = _} />
    <Input placeholder="Data" onRef={_ => data = _} />
    <Button onPress={() => {
      context.selectFunction = (type, nav) => {
        switchType(type)
        nav.goBack()
      }
      navigation.navigate('record.type', { current: createUI.type })
    }}>{`Type: ${createUI.type || 'Default'}`}</Button>
    <Button onPress={() => {
      context.selectFunction = (type, nav) => {
        switchPublicity(type)
        nav.goBack()
      }
      navigation.navigate('record.publicity', { current: createUI.publicity })
    }}>{`Publicity: ${createUI.publicity}`}</Button>
    <Button round uppercase onPress={_ => create(navigation, {
      identity,
      key: key.value,
      data: data.value,
      type: createUI.type ? context.value(`RecordType.${createUI.type}`, 'crsign') : null,
      publicity: context.value(`PublicityType.${createUI.publicity}`, 'crsign'),
    })}>Create</Button>
  </Block>
}))