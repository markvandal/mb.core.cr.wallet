import React, { useContext } from 'react'
import { Context } from '../../context'

import { withGalio, Block, Button, Text } from 'galio-framework'
import { styles } from '../styles/main'


export const Type = withGalio(
  ({ navigation, route: { params: { current } }, theme, styles }) => {
    const context = useContext(Context)

    return <Block flex center space="around">
      <Block style={styles.list_block_main}>
        <Text style={styles.list_block_title}>Выберите тип записи</Text>
        {
          Object.entries(context.getEnum('crsign.RecordType').valuesById).map(
            ([key, value]) => <Button
              key={key} round size="large" style={styles.list_block_item_button}
              color={(current === value ? theme.COLORS.PRIMARY : theme.COLORS.TINTED)}
              textStyle={{ color: current === value ? theme.COLORS.WHITE : theme.COLORS.PRIMARY }}
              onPress={() => context.selectFunction(value, navigation)}
            >{value}</Button>
          )
        }
        <Button round size="large" style={styles.list_block_item_button}
          color={(current === null ? theme.COLORS.PRIMARY : theme.COLORS.WHITE)}
          textStyle={{ color: current === null ? theme.COLORS.WHITE : theme.COLORS.PRIMARY }}
          onPress={() => context.selectFunction(null, navigation)}
        >По умолчанию</Button>
      </Block>
    </Block>
  }, styles)


