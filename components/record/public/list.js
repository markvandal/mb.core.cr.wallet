import React, { useContext, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import * as Analytics from 'expo-firebase-analytics'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { Error } from '../../error'

import { Context } from '../../../context'
import { recordActions, walletActions, spinnerActions } from '../../../store'
import { styles } from '../../styles/main'


export const PublicList = connect(
  ({ record: { records, loading }, wallet: { targetIdentity, identity }, errors }, ownProps) => ({
    records,
    loading,
    errors,
    targetIdentity,
    identity,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    startLoading: () => dispatch(spinnerActions.startLoading()),
    endLoading: () => dispatch(spinnerActions.endLoading()),
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
      Analytics.logEvent('record.public.update.try')
      const update = { id, action: context.value(`RecordUpdate.${action}`, 'crsign') }
      if (data !== undefined) {
        update.data = data
      }
      const res = await dispatch(recordActions.update(update))
      if (!res.error) {
        Analytics.logEvent('record.public.update.success')
      }
    },
    validate: async (record, value) => {
      Analytics.logEvent('record.public.validate.try')
      await dispatch(recordActions.validate({ record, value }))
    },
    create: (navigation, identity) => navigation.navigate('record.create', { identity }),
    ...ownProps
  }),
)(withGalio(({
  route: { params: { identityId } }, navigation,
  open, create, validate, update, startLoading, 
  endLoading, identity, targetIdentity, records, 
  errors, loading, theme, styles
}) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { open(identityId) }, []))

  const recordInputs = records.map(_ => ({
    data: ''
  }))

  if (loading) startLoading()
  else endLoading()

  return <Block flex center>
    <Text style={styles.list_block_title}>Паспорт</Text>
    <Block flex style={styles.list_block_main}>
      <Block card shadow flex style={styles.list_block_card}>
        <Block card borderless row middle style={styles.list_block_item_header}>
          <Text style={styles.list_block_item_label_value}>ID Паспорта:</Text>
          <Text style={styles.list_block_item_label_value}>{targetIdentity?.id}</Text>
        </Block>
        <Block row middle style={styles.list_block_item_header_odd}>
          <Text style={styles.list_block_item_label_value}>Тип документа:</Text>
          <Text style={styles.list_block_item_label_value}>{targetIdentity?.identityType}</Text>
        </Block>
        <Block card borderless row middle style={styles.list_block_item_header}>
          <Text style={styles.list_block_item_label_value}>Дата регистрации:</Text>
          <Text style={styles.list_block_item_label_info}>{targetIdentity?.creationDt}</Text>
        </Block>
      </Block>
      <Button round size="large" style={styles.list_block_item_button}
        onPress={_ => create(navigation, identityId)}>Создать запись</Button>
    </Block>
    <Block flex style={styles.list_block_main}>
      {
        records.map(
          (record, idx) => typeof record === 'string'
            ? <Block key={record} card flex style={styles.list_block_card}><Text>Record ID: {record}</Text></Block>
            : <Block key={record.id} card flex style={styles.list_block_card}>
              <Block card borderless row middle style={styles.list_block_item_header}>
                <Text style={styles.list_block_item_caption}>{`#${record.id} ${record.key}`}</Text>
                <Text style={styles.list_block_item_info}>{record.recordType}</Text>
              </Block>
              <Block style={styles.list_block_item_content}>
                <Text style={styles.app_info}>{record.data}</Text>
              </Block>
              <Block row middle style={styles.list_block_item_content}>
                <Input onChangeText={_ => recordInputs[idx].data = _}
                  onChange={({ nativeEvent }) => recordInputs[idx].data = nativeEvent.text}
                />
                <Button
                  onlyIcon
                  icon="verified"
                  iconFamily="material"
                  iconSize={theme.SIZES.SMALL_ICON}
                  color="primary"
                  iconColor={theme.COLORS.WHITE}
                  onPress={() => validate(record, recordInputs[idx].data)}
                />
              </Block>
              <Block row middle style={styles.list_block_item_header}>
                <Text style={styles.list_block_item_label_value}>Статус верификации:</Text>
                <Text style={styles.list_block_item_label_value}>{record.verified ? 'TRUE' : 'FALSE'}</Text>
              </Block>
              <Block row middle style={styles.list_block_item_header}>
                <Text style={styles.list_block_item_label_value}>Подпись:</Text>
              </Block>
              <Block style={styles.list_block_item_content}>
                <Text style={styles.app_info}>{record.signature}</Text>
              </Block>

              <Block row middle style={styles.list_block_item_header}>
                <Text style={styles.list_block_item_label_value}>Тип:</Text>
                <Text style={styles.list_block_item_label_value}>{record.recordType}</Text>
              </Block>
              <Block row middle style={styles.list_block_item_header_odd}>
                <Text style={styles.list_block_item_label_value}>Публичность:</Text>
                <Text style={styles.list_block_item_label_value}>{record.publicity}</Text>
              </Block>
              <Block row middle style={styles.list_block_item_header}>
                <Text style={styles.list_block_item_label_value}>Статус:</Text>
                <Text style={styles.list_block_item_label_value}>{record.status}</Text>
              </Block>
              <Block row middle style={styles.list_block_item_header_odd}>
                <Text style={styles.list_block_item_label_value}>Провайдер:</Text>
                <Text style={styles.list_block_item_label_value}>{record.provider}</Text>
              </Block>

              <Block style={styles.list_block_item_content}>
                <Error hideBlock={errors.error?.meta?.arg?.id !== record.id}/>
              </Block>

              <Block flex style={styles.list_block_item_actions}>
                {
                  ['RECORD_OPEN'].includes(record.status) && identity.id === record.provider
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="check" loading={loading} iconFamily="antdesign"
                      iconSize={theme.SIZES.SMALL_ICON} color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'RECORD_UPDATE_STORE', recordInputs[idx].data)}
                    >Записать</Button>
                    : null
                }
                {
                  ['RECORD_OPEN', 'RECORD_SIGNED'].includes(record.status)
                    && identity.id === record.provider
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="seal-variant" loading={loading} iconFamily="material-community"
                      iconSize={theme.SIZES.SMALL_ICON} color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'REOCRD_UPDATE_SEAL')}>Запечатать</Button>
                    : null
                }
                {
                  ['RECORD_OPEN', 'RECORD_SIGNED', 'RECORD_SEALED', 'RECORD_REJECTED'].includes(record.status)
                    && identity.id === record.provider
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="marker-cancel" loading={loading} iconFamily="material-community"
                      iconSize={theme.SIZES.SMALL_ICON} color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'REOCRD_UPDATE_WITHDRAW')}>Отозвать</Button>
                    : null
                }
                {
                  ['RECORD_SIGNED', 'RECORD_SEALED', 'RECORD_WITHDRAWN', 'RECORD_REJECTED'].includes(record.status)
                    && identity.id === record.provider
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="reload" loading={loading} iconFamily="ionicon"
                      iconSize={theme.SIZES.SMALL_ICON} color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'REOCRD_UPDATE_REOPEN')}>Переоткрыть</Button>
                    : null
                }
              </Block>
            </Block>
        )
      }
    </Block>
  </Block>
}, styles))