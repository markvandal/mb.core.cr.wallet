import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'

import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Card, Input } from 'galio-framework'
import { alertError } from '../../error'

import { Context } from '../../../context'
import { recordActions } from '../../../store'


export const PersonalList = connect(
  ({ record: { records }, wallet: { identity } }, ownProps) => ({
    identity,
    records,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    list: async () => {
      const res = await dispatch(recordActions.loadAll())
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
    ...ownProps
  }),
)(withGalio(({ navigation, list, update, records, identity, theme }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))
  const recordInputs = records.map(record => ({
    data: typeof record === 'object' ? record.data : null
  }))

  return <Block>
    <Button round uppercase onPress={() => navigation.navigate('record.create')}>Create record</Button>
    <Button round uppercase onPress={() => navigation.navigate('record.public.open')}>Read passport</Button>
    <Block>
      {
        records.map(
          (record, idx) => typeof record === 'string'
            ? <Card key={record}><Text>Record ID: {record}</Text></Card>
            : <Card key={record.id}
              title={`#${record.id} ${record.key}`}
              caption={record.recordType}
            >
              {
                ['RECORD_OPEN'].includes(record.status) && identity.id === record.provider
                  ? <Input placholder="Value" defaultValue={recordInputs[idx].data}
                    onChangeText={_ => recordInputs[idx].data = _} />
                  : <Text>Value: {record.data}</Text>
              }
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
              <Button
                onlyIcon
                icon="sharealt"
                iconFamily="antdesign"
                iconSize={20}
                color="primary"
                iconColor={theme.COLORS.WHITE}
                onPress={async () => {
                  try {
                    await Share.share(
                      {
                        title: `Meta-Belarus Value ${record.key}`,
                        message: recordInputs[idx].data,
                      }
                    )
                  } catch (_) {
                    Clipboard.setString(recordInputs[idx].data)
                  }
                }}
              />
              <Text>Signature: {record.signature}</Text>
              <Text>Type: {record.recordType}</Text>
              <Text>Publicity: {record.publicity}</Text>
              <Text>Status: {record.status}</Text>
              <Text>Provierd: {record.provider}</Text>
              <Text>Verified: {record.verified ? 'TRUE' : 'FALSE'}</Text>
              {
                ['RECORD_OPEN'].includes(record.status)
                  ? <Button
                    onlyIcon
                    icon="pencil"
                    iconFamily="entypo"
                    iconSize={20}
                    color="primary"
                    iconColor={theme.COLORS.WHITE}
                    onPress={() => update(context, record.id, 'RECORD_UPDATE_SIGN')}
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
                ['RECORD_OPEN', 'RECORD_SIGNED'].includes(record.status)
                  ? <Button
                    onlyIcon
                    icon="dislike2"
                    iconFamily="antdesign"
                    iconSize={20}
                    color="primary"
                    iconColor={theme.COLORS.WHITE}
                    onPress={() => update(context, record.id, 'REOCRD_UPDATE_REJECT')}
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
  </Block>
}))

const _extractValue = (idx, value, inputs, type = 'data') => {
  if (recordInputs[idx].data) {

  }
}