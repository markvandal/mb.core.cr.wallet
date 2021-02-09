import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

export { walletActions } from './wallet'
export { inviteActions } from './invite' 
export { authActions } from './auth' 
export { recordActions } from './record' 
export { testsActions } from './tests' 

import { context } from '../context'

import { wallet } from './wallet'
import { invite } from './invite'
import { auth } from './auth'
import { record } from './record'
import { tests } from './tests'


export const store = configureStore({ 
  reducer: combineReducers({
    wallet, invite, auth, tests, record
  }),
  middleware: [ thunk.withExtraArgument(context) ]
})
