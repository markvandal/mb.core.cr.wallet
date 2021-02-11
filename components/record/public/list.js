import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'

import { withGalio, Block, Button, Text, Card, Input } from 'galio-framework'
import { alertError } from '../../error'

import { Context } from '../../../context'
import { recordActions, walletActions } from '../../../store'


export const PublicList = connect(
  ({ record: { records }, wallet: { targetIdentity, identity } }, ownProps) => ({
    records,
    targetIdentity,
    identity,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    open: async (identityId) => {
      await dispatch(walletActions.open(identityId))
      const res = await dispatch(recordActions.loadAll(identityId))
      res.payload?.records?.forEach(
        record => {
          if ('string' === typeof record) {
            dispatch(recordActions.load(record))
          }
        }
      )
    },
    update: async (context, id, action, data = undefined) => {
      const update = { id, action: context.value(`RecordUpdate.${action}`, 'crsign') }
      if (data !== undefined) {
        update.data = data
      }
      const res = await dispatch(recordActions.update(update))
      if (res.error) {
        alertError(res.error.message)
      }
    },
    validate: async (record, value) => {
      const res = await dispatch(recordActions.validate({ record, value }))
      if (res.error) {
        alertError(res.error.message)
      }
    },
    create: (navigation, identity) => navigation.navigate('record.create', { identity }),
    ...ownProps
  }),
)(withGalio(({
  route: { params: { identityId } }, navigation,
  open, create, validate, update,
  identity, targetIdentity, records,
  theme,
}) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { open(identityId) }, []))

  const recordInputs = records.map(record => ({
    data: ''
  }))

  return <Block>
    <Text>Identity ID: {targetIdentity?.id}</Text>
    <Text>Type: {targetIdentity?.identityType}</Text>
    <Text>Registration date: {targetIdentity?.creationDt}</Text>
    <Button onPress={_ => create(navigation, identityId)}>Create</Button>
    {
      records.map(
        (record, idx) => typeof record === 'string'
          ? <Card key={record}><Text>Record ID: {record}</Text></Card>
          : <Card key={record.id}
            title={`#${record.id} ${record.key}`}
            caption={record.recordType}
          >
            <Text>{record.data}</Text>
            <Text>Signature: {record.signature}</Text>
            <Text>Type: {record.recordType}</Text>
            <Text>Publicity: {record.publicity}</Text>
            <Text>Status: {record.status}</Text>
            <Text>Provider: {record.provider}</Text>
            <Text>Verified: {record.verified ? 'TRUE' : 'false'} </Text>
            <Input onChangeText={_ => recordInputs[idx].data = _}
              onChange={({ nativeEvent }) => recordInputs[idx].data = nativeEvent.text}
            />
            <Button
              onlyIcon
              icon="verified"
              iconFamily="material"
              iconSize={20}
              color="primary"
              iconColor={theme.COLORS.WHITE}
              onPress={() => validate(record, recordInputs[idx].data)}
            />
            {
              ['RECORD_OPEN'].includes(record.status) && identity.id === record.provider
                ? <Button
                  onlyIcon
                  icon="check"
                  iconFamily="antdesign"
                  iconSize={20}
                  color="primary"
                  iconColor={theme.COLORS.WHITE}
                  onPress={() => update(context, record.id, 'RECORD_UPDATE_STORE', recordInputs[idx].data)}
                />
                : null
            }
            {
              ['RECORD_OPEN', 'RECORD_SIGNED'].includes(record.status)
                && identity.id === record.provider
                ? <Button
                  onlyIcon
                  icon="seal-variant"
                  iconFamily="material-community"
                  iconSize={20}
                  color="primary"
                  iconColor={theme.COLORS.WHITE}
                  onPress={() => update(context, record.id, 'REOCRD_UPDATE_SEAL')}
                />
                : null
            }
            {
              ['RECORD_OPEN', 'RECORD_SIGNED', 'RECORD_SEALED', 'RECORD_REJECTED'].includes(record.status)
                && identity.id === record.provider
                ? <Button
                  onlyIcon
                  icon="marker-cancel"
                  iconFamily="material-community"
                  iconSize={20}
                  color="primary"
                  iconColor={theme.COLORS.WHITE}
                  onPress={() => update(context, record.id, 'REOCRD_UPDATE_WITHDRAW')}
                />
                : null
            }
            {
              ['RECORD_SIGNED', 'RECORD_SEALED', 'RECORD_WITHDRAWN', 'RECORD_REJECTED'].includes(record.status)
                && identity.id === record.provider
                ? <Button
                  onlyIcon
                  icon="reload"
                  iconFamily="ionicon"
                  iconSize={20}
                  color="primary"
                  iconColor={theme.COLORS.WHITE}
                  onPress={() => update(context, record.id, 'REOCRD_UPDATE_REOPEN')}
                />
                : null
            }
          </Card>
      )
    }
  </Block>
}))