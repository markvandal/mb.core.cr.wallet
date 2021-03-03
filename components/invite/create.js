import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { inviteActions } from '../../store'
import { Context } from '../../context'
import { styles } from '../styles/main'


export const Create = connect(
  ({ invite: { currentInvite, newInvite } }, ownProps) =>
    ({ ...ownProps, invite: currentInvite, createUI: newInvite }),
  (dispatch, ownProps) => ({
    switchLevel: level => dispatch(inviteActions.switchLevel(level)),
    switchType: type => dispatch(inviteActions.switchType(type)),
    create: (context, type, level) => 
      dispatch(inviteActions.create({ 
        type: context.value(`IdentityType.${type}`), 
        level: context.value(`IdentityLevel.${level}`),
      })),
    ...ownProps,
  }),
)(withGalio(({ navigation, invite, createUI, create, switchLevel, switchType, theme, styles }) => {
  const context = useContext(Context)

  return <Block middle flex>
    {
      invite
        ? <Block>
          <Text style={styles.list_block_title} h4 color="primary">Приглашение создано</Text>
          <Block>
            <Text>{`${invite.inviteId} ${invite.mnemonic}`}</Text>
            <Button
                onlyIcon
              icon="sharealt"
              iconFamily="antdesign" 
              iconSize={theme.SIZES.SMALL_ICON}
              color="primary"
              style={styles.content_button}
              round size="large"
              iconColor={theme.COLORS.WHITE} 
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
        : <Block>
          <Button
              round size="large"
              style={styles.content_button}
              onPress={() => {
            context.selectFunction = (type, nav) => {
              switchType(type)
              nav.goBack()
            }
            navigation.navigate('invite.type', { current: createUI.type })
          }}>{`Тип: ${createUI.type}`}</Button>
          <Button round size="large"style={styles.content_button}
                  onPress={() => {
            context.selectFunction = (level, nav) => {
              switchLevel(level)
              nav.goBack()
            }
            navigation.navigate('invite.level', { current: createUI.level })
          }}>{`Уровень: ${createUI.level}`}</Button>
          <Button round size="large" style={styles.content_button}
                  onPress={() => create(context, createUI.type, createUI.level)}>Создать</Button>
        </Block>
    }
  </Block>
}, styles))


