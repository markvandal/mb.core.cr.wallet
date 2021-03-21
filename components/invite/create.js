import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'
import * as Analytics from 'expo-firebase-analytics'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { Error } from '../error'

import { inviteActions, spinnerActions } from '../../store'
import { Context } from '../../context'
import { styles } from '../styles/main'


export const Create = connect(
  ({ invite: { currentInvite, newInvite, loading } }, ownProps) =>
    ({ ...ownProps, loading, invite: currentInvite, createUI: newInvite }),
  (dispatch, ownProps) => ({
    startLoading: () => dispatch(spinnerActions.startLoading()),
    endLoading: () => dispatch(spinnerActions.endLoading()),
    switchLevel: level => dispatch(inviteActions.switchLevel(level)),
    switchType: type => dispatch(inviteActions.switchType(type)),
    create: (context, type, level) => {
      Analytics.logEvent('invite.create.try')
      const res = dispatch(inviteActions.create({
        type: context.value(`IdentityType.${type}`),
        level: context.value(`IdentityLevel.${level}`),
      }))
      if (!res.error) {
        Analytics.logEvent('invite.create.success')
      }

    },
    ...ownProps,
  }),
)(withGalio(({
  navigation, invite, createUI, create, loading,
  switchLevel, switchType, startLoading, endLoading, theme, styles
}) => {
  const context = useContext(Context)

  if (loading) startLoading()
  else endLoading()

  return <Block middle flex>
    {
      invite
        ? <Block style={styles.list_block_main}>
          <Text style={styles.list_block_title}>Приглашение создано</Text>
          <Block row middle style={styles.list_block_item_content}>
            <Text style={styles.app_text}>{`${invite.inviteId} ${invite.mnemonic}`}</Text>
            <Button onlyIcon icon="sharealt" iconFamily="antdesign" iconSize={theme.SIZES.ICON}
              color="primary" iconColor={theme.COLORS.WHITE}
              onPress={async () => {
                try {
                  await Share.share(
                    {
                      title: 'Meta-Belarus Invite',
                      message: `${invite.inviteId} ${invite.mnemonic}`,
                    }
                  )
                } catch (_) {
                  Clipboard.setString(`${invite.inviteId} ${invite.mnemonic}`)
                }
              }}
            />
          </Block>
        </Block>
        : <Block style={styles.list_block_main}>
          <Text style={styles.list_block_title}>Создать приглашение</Text>
          <Button round size="large" style={styles.list_block_item_button}
            onPress={() => {
              context.selectFunction = (type, nav) => {
                switchType(type)
                nav.goBack()
              }
              navigation.navigate('invite.type', { current: createUI.type })
            }}>{`Тип: ${createUI.type}`}</Button>
          <Button round size="large" style={styles.list_block_item_button}
            onPress={() => {
              context.selectFunction = (level, nav) => {
                switchLevel(level)
                nav.goBack()
              }
              navigation.navigate('invite.level', { current: createUI.level })
            }}>{`Уровень: ${createUI.level}`}</Button>

          <Block style={styles.list_block_item_content}>
            <Error />
          </Block>
          <Button round size="large" style={styles.list_block_item_button}
            onPress={() => {
              create(context, createUI.type, createUI.level)
            }}>Создать</Button>
        </Block>
    }
  </Block>
}, styles))