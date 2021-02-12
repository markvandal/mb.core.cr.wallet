import React, { useContext, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';

import { connect } from 'react-redux'
import { Context } from '../context'

import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { walletActions } from '../store'
import { list as listRecords } from './record/helper'


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

  return <Block>
    {
      mnemonic
        ? <Block>
          {
            firstName || lastName
              ? <Text>{identity?.identityType}: {firstName?.data} {lastName?.data}</Text>
              : null
          }
          <Button onPress={() => signOut(navigation)}>Sign Out</Button>
          <Button onPress={() => navigation.navigate('invite.create')}>Invite</Button>
          <Button onPress={() => navigation.navigate('auth.list')}>Services</Button>
          <Button onPress={() => navigation.navigate('record.personal.list')}>ID Records</Button>
          {
            context.config.DEBUG_AUTH && mnemonic
              ? <Button round uppercase onPress={() => navigation.navigate('tests')}>Tests</Button>
              : null
          }
          <Text>Secret: {name}...</Text>
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
        : <Block>
          <Button round uppercase onPress={() => navigation.navigate('auth')}>Auth</Button>
          <Button round uppercase onPress={() => navigation.navigate('invite.accept')}>Create ID</Button>
        </Block>
    }
  </Block>
}))