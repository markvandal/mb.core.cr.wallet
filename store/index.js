import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

export { walletActions } from './wallet'
export { inviteActions } from './invite' 

import { context } from '../context'

import { wallet } from './wallet'
import { invite } from './invite'


export const store = configureStore({ 
  reducer: combineReducers({
    wallet, invite
  }),
  middleware: [ thunk.withExtraArgument(context) ]
})
