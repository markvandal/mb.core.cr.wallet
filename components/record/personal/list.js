import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'

import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Card, Input } from 'galio-framework'
import { alertError } from '../../error'

import { Context } from '../../../context'
import { recordActions } from '../../../store'
import { list } from '../helper'


export const PersonalList = connect(
  ({ record: { records }, wallet: { identity } }, ownProps) => ({
    identity,
    records,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    list: list(dispatch),
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
    createPassport: async (context, inputs, records) => {
      const keys = context.config.listDefaultRecords()
      for (const key of keys) {
        const record = records[key]
        if (record && record.id) {
          if (record.status === 'RECORD_OPEN') {
            await dispatch(recordActions.update({
              id: record.id, data: inputs[key],
              action: context.value(`RecordUpdate.RECORD_UPDATE_STORE`, 'crsign'),
            }))
          }
        } else if (inputs[key]) {
          await dispatch(recordActions.create({ key, data: inputs[key] }))
        }
      }
      await list(dispatch)()
    },
    signPassport: async (context, records) => {
      const keys = context.config.listDefaultRecords()
      for (const key of keys) {
        const record = records[key]
        if (record && record.id && record.status === 'RECORD_OPEN') {
          const setting = context.config.getRecordSettingByKey(key)
          const action = context.value(`RecordUpdate.${setting.restrictions?.includes('REOCRD_UPDATE_SEAL')
            ? 'REOCRD_UPDATE_SIGN'
            : 'REOCRD_UPDATE_SEAL'
            }`, 'crsign')
          await dispatch(recordActions.update({ id: record.id, action }))
        }
      }
      await list(dispatch)()
    },
    ...ownProps
  }),
)(withGalio(({ navigation, list, update, createPassport, signPassport, records, identity, theme }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))

  const defaultRecordKeys = context.config.listDefaultRecords().filter(
    (_, idx) => context.config.defaultRecords[idx].types.includes(identity.identityType)
  )
  const defaultRecords = records.reduce((records, record) => {
    if (context.config.isDefaultRecord(record.key)) {
      return { ...records, [record.key]: { ...record } }
    }

    return records
  }, {})

  const notSetRecordInputs = defaultRecordKeys.reduce((inputs, key) => {
    const setting = context.config.getRecordSettingByKey(key)
    const value = setting.defaults ? setting.defaults[identity.identityType] : null
    if (value) {
      return { ...inputs, [key]: value }
    }
    if (defaultRecords[key]) {
      return { ...inputs, [key]: defaultRecords[key].data }
    }

    return inputs
  }, {})

  const recordInputs = records.map(record => ({
    data: typeof record === 'object' ? record.data : null
  }))

  return <Block>
    <Button round uppercase onPress={() => navigation.navigate('record.create')}>Create record</Button>
    <Button round uppercase onPress={() => navigation.navigate('record.public.open')}>Read passport</Button>
    <Block>
      <Text h3>Passport records</Text>
      {
        defaultRecordKeys.map(key => {
          const record = defaultRecords[key] || { notSet: true }
          const setting = context.config.getRecordSettingByKey(key)

          const props = setting.defaults && setting.defaults[identity.identityType]
            ? { value: setting.defaults[identity.identityType] }
            : { defaultValue: notSetRecordInputs[key] }

          return <Card key={key}
            title={setting.label}
            caption={`${record.id ? `#${record.id} ` : ''}${setting.key}`}
          >
            {
              record.notSet || record.status === 'RECORD_OPEN'
                ? <Block>
                  <Input placeholder={setting.label}
                    onChange={({ nativeEvent }) => notSetRecordInputs[key] = nativeEvent.text}
                    {...props}
                  />
                  {
                    record.status
                      ? <Text>Status: {record.status}</Text>
                      : null
                  }
                  <Text>Publicity: PRIVATE</Text>
                </Block>
                : <Block>
                  <Text>Value: {record.data}</Text>
                  <Text>Status: {record.status}</Text>
                  <Text>Publicity: {record.publicity}</Text>
                </Block>
            }
          </Card>
        })
      }
      {
        !defaultRecordKeys.find(key => defaultRecords[key])
          || defaultRecordKeys.find(key => defaultRecords[key]?.status === 'RECORD_OPEN')
          ? <Button round uppercase onPress={() => createPassport(context, notSetRecordInputs, defaultRecords)}>Save</Button>
          : null
      }
      {
        defaultRecordKeys.find(key => defaultRecords[key])
          && defaultRecordKeys.find(key => defaultRecords[key]?.status === 'RECORD_OPEN')
          ? <Button round uppercase onPress={() => signPassport(context, defaultRecords)}>Sign</Button>
          : null
      }
    </Block>
    <Block>
      <Text h3>Unstructured records</Text>
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