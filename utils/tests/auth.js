
import { testsActions, authActions } from '../../store'

import { wrapConextWithNewUser } from './helper'

export const testAuth = async (context, redux) => {
  const dispatch = redux.store.dispatch

  
  try {
    let res = null
    let _serviceId = null
    await wrapConextWithNewUser(context, redux, async (currentId, serviceId) => {
      res = await dispatch(authActions.request(currentId))
      _serviceId = serviceId
      console.log('Requested auth result', res)
      dispatch(testsActions.log(`Requested auth ${res.payload.newAuth.authId} "${res.payload.newAuth.key}"`))
    })
  
    res = await dispatch(authActions.sign(_serviceId))
    console.log('Confirm auth result', res)
    dispatch(testsActions.log(`Authentication signed for service #${res.payload.service}`))
  } catch (e) {
    console.log(e)
    dispatch(testsActions.log(`Error during test ${e}`))
  }
}