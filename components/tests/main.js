import React, { useContext } from 'react'
import { connect, ReactReduxContext } from 'react-redux'

import { 
  withGalio, 
  Block, 
  Button,
  Text
} from 'galio-framework'

import { Context } from '../../context'

import { testInvite } from '../../utils/tests'
import { testsActions } from '../../store'


export const TestMain = connect(
  ({ tests }, ownProps) => ({ ...ownProps, tests }),
  (dispatch, ownProps) => ({
    testInvite: (context, redux) => {
      dispatch(testsActions.setUp('invite'))
      testInvite(context, redux)
    },
    ...ownProps
  })
)(withGalio(({ navigation, testInvite, tests }) => {
  const context = useContext(Context)
  const redux = useContext(ReactReduxContext)

  return <Block>
    <Button round uppercase onPress={() => testInvite(context, redux)}>Test Invite</Button>
    <Text h4>{tests.name}</Text>
    {
      tests.name 
      ? <Block>
          {tests.logs.map((entry, idx) => <Text key={idx}>{entry}</Text>)}
        </Block>
      : null
    }
    <Button round uppercase onPress={() => navigation.navigate('main')}>Back</Button>
  </Block>
}))