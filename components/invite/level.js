import React, { useContext } from 'react'
import { Context } from '../../context'

import { withGalio, Block, Button } from 'galio-framework'


export const Level = withGalio(({ navigation, route: { params: { current }}, theme }) => {
  const context = useContext(Context)

  return <Block>
    {
      Object.entries(context.getEnum('mbcorecr.IdentityLevel').valuesById).map(
        ([key, value]) => <Button
          key={key}
          color={(current === value ? theme.COLORS.PRIMARY : theme.COLORS.WHITE)}
          textStyle={{color: current === value ? theme.COLORS.WHITE : theme.COLORS.PRIMARY}}
          onPress={() => context.selectFunction(value, navigation)}
        >{value}</Button>
      )
    }
  </Block>
})


