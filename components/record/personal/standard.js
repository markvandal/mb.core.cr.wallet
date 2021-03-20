import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import * as Analytics from 'expo-firebase-analytics'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { Error } from '../../error'

import { Context } from '../../../context'
import { recordActions } from '../../../store'
import { list } from '../helper'
import { styles } from '../../styles/main'
import { spinnerActions } from '../../../store'


export const StandardList = connect(
  ({ record: { records, loading }, wallet: { identity }, errors }, ownProps) => ({
    errors,
    identity,
    loading,
    records,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    list: list(dispatch),
    createPassport: async (context, inputs, records) => {
      dispatch(spinnerActions.startLoading())
      Analytics.logEvent('record.standard.passport.create')
      const keys = context.config.listDefaultRecords()
      for (const key of keys) {
        const record = records[key]
        if (record && record.id) {
          if (record.status === 'RECORD_OPEN') {
            const res = await dispatch(recordActions.update({
              id: record.id, data: inputs[key],
              action: context.value(`RecordUpdate.RECORD_UPDATE_STORE`, 'crsign'),
            }))
            if (res.error) {
              break
            }
          }
        } else if (inputs[key]) {
          const res = await dispatch(recordActions.create({ key, data: inputs[key] }))
          if (res.error) {
            break
          }
        }
        

      }
      await list(dispatch)()
      dispatch(spinnerActions.endLoading())
    },
    signPassport: async (context, records) => {
      dispatch(spinnerActions.startLoading())
      const keys = context.config.listDefaultRecords()
      Analytics.logEvent('record.standard.passport.sign')
      for (const key of keys) {
        const record = records[key]
        if (record && record.id && record.status === 'RECORD_OPEN') {
          const setting = context.config.getRecordSettingByKey(key)
          const action = context.value(`RecordUpdate.${setting.restrictions?.includes('REOCRD_UPDATE_SEAL')
            ? 'REOCRD_UPDATE_SIGN'
            : 'REOCRD_UPDATE_SEAL'
            }`, 'crsign')
          const res = await dispatch(recordActions.update({ id: record.id, action }))
          if (res.error) {
            break
          }
        }
      }
      await list(dispatch)()
      dispatch(spinnerActions.endLoading())
    },
    ...ownProps
  }),
)(withGalio(({
  navigation, list, createPassport, signPassport,
  records, identity, loading, errors, styles
}) => {
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

  return <Block flex center>
    <Button round size="large" style={styles.content_button}
      onPress={() => navigation.navigate('record.personal.list')}>Пометки</Button>
    <Block flex style={styles.list_block_main}>
      <Text style={styles.list_block_title}>Персональные данные</Text>
      {
        defaultRecordKeys.map(key => {
          const record = defaultRecords[key] || { notSet: true }
          const setting = context.config.getRecordSettingByKey(key)

          const props = setting.defaults && setting.defaults[identity.identityType]
            ? { value: setting.defaults[identity.identityType] }
            : { defaultValue: notSetRecordInputs[key] }

          return <Block key={key} style={styles.list_block_item}>
            {
              record.notSet || record.status === 'RECORD_OPEN'
                ? <Block row style={styles.list_block_item_label}>
                  <Text style={styles.list_block_item_label_caption}>{setting.label}</Text>
                  <Text style={styles.list_block_item_label_info}
                  >{`${record.id ? `#${record.id}:` : ''}${setting.key}`}</Text>
                </Block>
                : null
            }
            {
              record.notSet || record.status === 'RECORD_OPEN'
                ? <Block>
                  <Input placeholder={setting.label} {...props}
                    onChange={({ nativeEvent }) => notSetRecordInputs[key] = nativeEvent.text} />
                </Block>
                : <Block row style={styles.list_block_item_label}>
                  <Text style={styles.list_block_item_label_caption}>{setting.label}:</Text>
                  <Text style={styles.list_block_item_label_value}>{record.data}</Text>
                </Block>
            }
            <Error hideBlock={
              errors.error?.meta?.arg?.id !== record.id && errors.error?.meta?.arg?.key !== key
            } />
          </Block>
        })
      }
    </Block>
    {
      !defaultRecordKeys.find(key => defaultRecords[key])
        || defaultRecordKeys.find(key => defaultRecords[key]?.status === 'RECORD_OPEN')
        || defaultRecordKeys.find(key => !defaultRecords[key])
        ? <Button round size="large" style={styles.content_button} loading={loading}
          onPress={() => {
            createPassport(context, notSetRecordInputs, defaultRecords)
          }}>Сохранить</Button>
        : null
    }
    {
      defaultRecordKeys.find(key => defaultRecords[key])
        && defaultRecordKeys.find(key => defaultRecords[key]?.status === 'RECORD_OPEN')
        ? <Button round size="large" style={styles.content_button} loading={loading}
          onPress={() => signPassport(context, defaultRecords)}>Подписать</Button>
        : null
    }
  </Block>
}, styles))