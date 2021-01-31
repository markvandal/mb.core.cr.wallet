import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Share } from 'react-native'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { inviteActions } from '../../store'
import { Context } from '../../context'


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
)(withGalio(({ navigation, invite, createUI, create, switchLevel, switchType, theme }) => {
  const context = useContext(Context)

  return <Block>
    {
      invite
        ? <Block>
          <Text h4 color="primary">Invite created</Text>
          <Block>
            <Text>{`${invite.inviteId} ${invite.mnemonic}`}</Text>
            <Button 
              onlyIcon 
              icon="sharealt"
              iconFamily="antdesign" 
              iconSize={30} 
              color="warning" 
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
          <Button onPress={() => {
            context.selectFunction = (type, nav) => {
              switchType(type)
              nav.goBack()
            }
            navigation.navigate('invite.type', { current: createUI.type })
          }}>{`Type: ${createUI.type}`}</Button>
          <Button onPress={() => {
            context.selectFunction = (level, nav) => {
              switchLevel(level)
              nav.goBack()
            }
            navigation.navigate('invite.level', { current: createUI.level })
          }}>{`Level: ${createUI.level}`}</Button>
          <Button onPress={() => create(context, createUI.type, createUI.level)}>Create</Button>
        </Block>
    }
  </Block>
}))


