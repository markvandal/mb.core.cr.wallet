import React, { useContext, useCallback, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { connect } from 'react-redux'
import Clipboard from 'expo-clipboard'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { Error } from '../error'

import { Context } from '../../context'
import { authActions } from '../../store'
import { decrypt } from '../../utils/ledger/crypt'
import { styles } from '../styles/main';


export const List = connect(
  ({ auth: { list }, wallet: { identity }, errors }, ownProps) =>
    ({ auth: list, identity, errors, ...ownProps }),
  (dispatch, ownProps) => ({
    list: async () => {
      const res = await dispatch(authActions.list())
      for (let idx = 0; idx < res.payload?.length; ++idx) {
        if ('string' === typeof res.payload[idx]) {
          await dispatch(authActions.load(idx))
        }
      }
    },
    sign: idx => dispatch(authActions.sign(idx)),
    ...ownProps,
  }),
)(withGalio(({ navigation, auth, identity, list, sign, errors, theme, styles }) => {
  const context = useContext(Context)
  useFocusEffect(useCallback(() => { list() }, []))

  return <Block middle center>
    {
      identity.identityType === 'SERVICE'
        ? <Button round size="large" style={styles.content_button}
          onPress={() => navigation.navigate('auth.request')}
        >Запросить аутентификацию</Button>
        : null
    }
    <Block flex style={styles.list_block_main}>
      {
        auth.map(
          (auth, idx) => 'string' === typeof auth
            ? <Block key={auth} card flex style={styles.list_block_card}><Text>Auth: {auth}</Text></Block>
            : (() => {
              const sessionToken = decrypt(context.wallet, auth.key)

              return <Block key={`${auth.service}:${auth.identity}`} card flex style={styles.list_block_card}>
                <Block card borderless row middle style={styles.list_block_item_header}>
                  <Text style={styles.list_block_item_caption}>ID Службы</Text>
                  <Text style={styles.list_block_item_value}>{auth.service}</Text>
                </Block>
                <Block row middle style={styles.list_block_item_header_odd}>
                  <Text style={styles.list_block_item_label_value}>Статус:</Text>
                  <Text style={styles.list_block_item_label_value}>{auth.status}</Text>
                </Block>

                <Block row middle style={styles.list_block_item_header}>
                  <Text style={styles.list_block_item_label_value}>Зашифрованный ключ:</Text>
                </Block>
                <Block style={styles.list_block_item_content}>
                  <Text style={styles.app_info}>{auth.key}</Text>
                </Block>

                <Block row middle style={styles.list_block_item_header}>
                  <Text style={styles.list_block_item_label_value}>Ключ сессии:</Text>
                </Block>
                <Block style={styles.list_block_item_content}>
                  <Text style={styles.app_info}>{sessionToken}</Text>
                </Block>

                <Block style={styles.list_block_item_content}>
                  <Error hideBlock={idx !== errors.error?.meta?.arg} />
                </Block>

                <Block flex style={styles.list_block_item_actions}>
                  {
                    (() => {
                      switch (auth.status) {
                        case 'AUTH_OPEN':
                          return <Button round size="large" style={styles.list_block_item_button}
                            icon="pencil"
                            iconFamily="entypo"
                            iconSize={theme.SIZES.ICON}
                            color="primary"
                            iconColor={theme.COLORS.WHITE}
                            onPress={() => sign(idx)}>Подписать</Button>
                        case 'AUTH_SIGNED':
                          return <Button round size="large" style={styles.list_block_item_button}
                            icon="sharealt"
                            iconFamily="antdesign"
                            iconSize={theme.SIZES.ICON}
                            color="primary"
                            iconColor={theme.COLORS.WHITE}
                            onPress={() => Clipboard.setString(`${sessionToken}`)}>Скопировать ключ</Button>
                      }
                    })()
                  }
                </Block>
              </Block>
            })()
        )
      }
    </Block>
  </Block>
}, styles))