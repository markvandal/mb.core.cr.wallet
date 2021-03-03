import React, { useContext, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';

import { connect } from 'react-redux'
import { Context } from '../context'

import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { walletActions } from '../store'
import { list as listRecords } from './record/helper'
import { styles } from './styles/main';


export const Main = connect(
  ({ wallet: { mnemonic, identity, address }, record: { records } }, ownProps) => (
    {
      identity,
      address,
      records,
      mnemonic,
      ...ownProps,
    }),
  (dispatch, ownProps) => ({
    signOut: navigation => {
      dispatch(walletActions.signOut())
      navigation.setParams({})
    },
    listRecords: listRecords(dispatch),
    ...ownProps,
  })
)(withGalio(({ navigation, mnemonic, signOut, listRecords, identity, address, records, theme, styles }) => {
  const [name] = mnemonic ? mnemonic.split(' ') : [null]
  const context = useContext(Context)
  useFocusEffect(useCallback(() => {
    if (mnemonic) {
      listRecords()
    }
  }, [mnemonic]))

  const firstName = records.find(record => record.key === 'mb.citizen.self.firstname')
  const lastName = records.find(record => record.key === 'mb.citizen.self.lastname')

  return <Block space="around" flex>
    {
      mnemonic
        ? <Block center>
          {
            firstName || lastName
              ? <Text>{identity?.identityType}: {firstName?.data} {lastName?.data}</Text>
              : null
          }
          <Block row middle>
            <Text style={styles.app_info}>Адресс: {address}</Text>
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
                      title: 'Meta-Belarus ID Address',
                      message: address,
                    }
                  )
                } catch (_) {
                  Clipboard.setString(address)
                }
              }}
            />
          </Block>
          <Button round size="large" style={styles.content_button}
            onPress={() => signOut(navigation)}>Закрыть паспорт</Button>
          <Button round size="large" style={styles.content_button}
            onPress={() => navigation.navigate('record.personal.standard')}>Посмотреть свой паспорт</Button>
          <Button round size="large" style={styles.content_button}
            onPress={() => navigation.navigate('auth.list')}>Просмотреть службы</Button>
          <Button ound size="large" style={styles.content_button}
            onPress={() => navigation.navigate('record.public.open')}>Посмотреть чей-то паспорт</Button>
          <Button round size="large" style={styles.content_button}
            onPress={() => navigation.navigate('invite.create')}>Создать приглашение</Button>
          {
            context.config.DEBUG_AUTH && mnemonic
              ? <Button round size="large" style={styles.content_button}
                onPress={() => navigation.navigate('tests')}>Tests</Button>
              : null
          }
          <Block row middle>
            <Text>Секрет: {name}...</Text>
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
                      title: 'Meta-Belarus ID Secret',
                      message: mnemonic,
                    }
                  )
                } catch (_) {
                  Clipboard.setString(mnemonic)
                }
              }}
            />
          </Block>
        </Block>
        : <Block center>
          <Button round size="large" style={styles.content_button}
            onPress={() => navigation.navigate('auth')}>Представиться</Button>
          <Button round size="large" style={styles.content_button}
            onPress={() => navigation.navigate('invite.accept')}>Принять приглашение</Button>
        </Block>
    }
  </Block>
}, styles))