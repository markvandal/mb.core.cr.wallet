import React, { useContext } from 'react'
import { Context } from '../../context'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { styles } from '../styles/main'


export const Level = withGalio(({ navigation, route: { params: { current } }, styles, theme }) => {
  const context = useContext(Context)

  return <Block flex center space="around">
    <Block style={styles.list_block_main}>
      <Text style={styles.list_block_title}>Выберите уровень приглашения</Text>
      {
        Object.entries(context.getEnum('mbcorecr.IdentityLevel').valuesById).map(
          ([key, value]) => <Button key={key} round size="large" style={styles.list_block_item_button}
            color={(current === value ? theme.COLORS.PRIMARY : theme.COLORS.WHITE)}
            textStyle={{ color: current === value ? theme.COLORS.WHITE : theme.COLORS.PRIMARY }}
            onPress={() => context.selectFunction(value, navigation)}
          >{value}</Button>
        )
      }
    </Block>
  </Block>
}, styles)


