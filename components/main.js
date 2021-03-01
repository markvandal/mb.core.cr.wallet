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
  ({ wallet: { mnemonic, identity }, record: { records } }, ownProps) => (
    {
      identity,
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
)(withGalio(({ navigation, mnemonic, signOut, listRecords, identity, records, theme }) => {
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
          <Button round size="large" onPress={() => signOut(navigation)}>Выйти</Button>
          <Button round size="large" onPress={() => navigation.navigate('invite.create')}>Создать приглашение</Button>
          <Button round size="large" onPress={() => navigation.navigate('auth.list')}>Службы</Button>
          <Button round size="large" onPress={() => navigation.navigate('record.personal.list')}>Паспорт</Button>
          {
            context.config.DEBUG_AUTH && mnemonic
              ? <Button round size="large" onPress={() => navigation.navigate('tests')}>Tests</Button>
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
          <Button round size="large" style={styles.app_text} onPress={() => navigation.navigate('auth')}>Войти</Button>
          <Button round size="large" style={styles.app_text} onPress={() => navigation.navigate('invite.accept')}>Принять приглашение</Button>
        </Block>
    }
  </Block>
}))