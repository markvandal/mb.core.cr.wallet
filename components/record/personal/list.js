import React, { useContext, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'

import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text, Input } from 'galio-framework'
import { Error } from '../../error'

import { Context } from '../../../context'
import { recordActions } from '../../../store'
import { list } from '../helper'
import { styles } from '../../styles/main'


export const PersonalList = connect(
  ({ record: { records }, wallet: { identity }, errors }, ownProps) => ({
    identity,
    records,
    errors,
    ...ownProps
  }),
  (dispatch, ownProps) => ({
    list: list(dispatch),
    update: async (context, id, action, data = undefined) => {
      const update = { id, action: context.value(`RecordUpdate.${action}`, 'crsign') }
      if (data !== undefined) {
        update.data = data
      }
      await dispatch(recordActions.update(update))
    },
    ...ownProps
  }),
)(withGalio(({ navigation, list, update, records, identity, errors, theme, styles }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))

  const recordInputs = records.map(record => ({
    data: typeof record === 'object' ? record.data : null
  }))

  return <Block flex center>
    <Button round size="large" style={styles.content_button}
      onPress={() => navigation.navigate('record.personal.standard')}>Персональные данные</Button>
    <Button round size="large" style={styles.content_button}
      onPress={() => navigation.navigate('record.create')}>Создать запись</Button>
    <Block flex style={styles.list_block_main}>
      <Text style={styles.list_block_title}>Пометки</Text>
      {
        records.map(
          (record, idx) => typeof record === 'string'
            ? <Block key={record} card flex style={styles.list_block_card}><Text>Record ID: {record}</Text></Block>
            : <Block key={record.id} card flex style={styles.list_block_card}>
              <Block card borderless row middle style={styles.list_block_item_header}>
                <Text style={styles.list_block_item_caption}>{`#${record.id} ${record.key}`}</Text>
                <Text style={styles.list_block_item_info}>{record.recordType}</Text>
              </Block>
              <Block row middle style={styles.list_block_item_content}>
                {
                  ['RECORD_OPEN'].includes(record.status) && identity.id === record.provider
                    ? <Input placholder="Value" defaultValue={recordInputs[idx].data}
                      onChangeText={_ => recordInputs[idx].data = _} />
                    : <Text style={styles.app_text}>{record.data}</Text>
                }
                {
                  ['RECORD_OPEN'].includes(record.status) && identity.id === record.provider
                    ? <Button
                      onlyIcon
                      icon="check"
                      iconFamily="antdesign"
                      iconSize={theme.SIZES.SMALL_ICON}
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
                  iconSize={theme.SIZES.SMALL_ICON}
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
              </Block>
              <Block style={styles.list_block_item_content}>
                <Error hideBlock={errors.error?.meta?.arg?.id !== record.id}/>
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
              <Block flex style={styles.list_block_item_actions}>
                {
                  ['RECORD_OPEN'].includes(record.status)
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="pencil"
                      iconFamily="entypo"
                      iconSize={theme.SIZES.ICON}
                      color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'RECORD_UPDATE_SIGN')}>Подписать</Button>
                    : null
                }
                {
                  ['RECORD_OPEN', 'RECORD_SIGNED'].includes(record.status)
                    && identity.id === record.provider
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="seal-variant"
                      iconFamily="material-community"
                      iconSize={theme.SIZES.ICON}
                      color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'REOCRD_UPDATE_SEAL')}>Запечатать</Button>
                    : null
                }
                {
                  ['RECORD_OPEN', 'RECORD_SIGNED'].includes(record.status)
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="dislike2"
                      iconFamily="antdesign"
                      iconSize={theme.SIZES.ICON}
                      color="primary"
                      iconColor={theme.COLORS.WHITE}
                      onPress={() => update(context, record.id, 'REOCRD_UPDATE_REJECT')}>Отклонить</Button>
                    : null
                }
                {
                  ['RECORD_SIGNED', 'RECORD_SEALED', 'RECORD_WITHDRAWN', 'RECORD_REJECTED'].includes(record.status)
                    && identity.id === record.provider
                    ? <Button round size="large" style={styles.list_block_item_button}
                      icon="reload"
                      iconFamily="ionicon"
                      iconSize={theme.SIZES.ICON}
                      color="primary"
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