import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'


export { walletActions } from './wallet'

import { wallet } from './wallet'


export const reducer = combineReducers({
  wallet
})

export const store = configureStore({ reducer })
