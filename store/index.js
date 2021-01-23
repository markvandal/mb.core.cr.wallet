import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

export { walletActions } from './wallet'
export { inviteActions } from './invite' 
export { testsActions } from './tests' 

import { context } from '../context'

import { wallet } from './wallet'
import { invite } from './invite'
import { tests } from './tests'


export const store = configureStore({ 
  reducer: combineReducers({
    wallet, invite, tests
  }),
  middleware: [ thunk.withExtraArgument(context) ]
})
