import React, { useContext } from 'react'
import { connect, ReactReduxContext } from 'react-redux'

import {
  withGalio,
  Block,
  Button,
  Text
} from 'galio-framework'

import { Context } from '../../context'

import { testInvite, testAuth } from '../../utils/tests'
import { testsActions } from '../../store'


export const TestMain = connect(
  ({ tests }, ownProps) => ({ ...ownProps, tests }),
  (dispatch, ownProps) => ({
    testInvite: (context, redux) => {
      dispatch(testsActions.setUp('invite'))
      testInvite(context, redux)
    },
    testAuth: (context, redux) => {
      dispatch(testsActions.setUp('auth'))
      testAuth(context, redux)
    },
    ...ownProps
  })
)(withGalio(({ testInvite, testAuth, tests }) => {
  const context = useContext(Context)
  const redux = useContext(ReactReduxContext)

  return <Block>
    <Button round uppercase onPress={() => testInvite(context, redux)}>Test Invite</Button>
    <Button round uppercase onPress={() => testAuth(context, redux)}>Test Auth</Button>
    <Text h4>{tests.name}</Text>
    {
      tests.name
        ? <Block>
          {tests.logs.map((entry, idx) => <Text key={idx}>{entry}</Text>)}
        </Block>
        : null
    }
  </Block>
}))