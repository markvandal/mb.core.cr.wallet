import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

export { walletActions } from './wallet'
export { inviteActions } from './invite' 
export { authActions } from './auth' 
export { recordActions } from './record' 
export { testsActions } from './tests' 
export { errorsActions } from './error' 
export {spinnerActions} from './spinner'

import { context } from '../context'

import { wallet } from './wallet'
import { invite } from './invite'
import { auth } from './auth'
import { record } from './record'
import { tests } from './tests'
import { errors, errorsActions } from './error'
import { spinner } from './spinner'


export const store = configureStore({ 
  reducer: combineReducers({
    wallet, invite, auth, tests, record, errors, spinner
  }),
  middleware: [ 
    thunk.withExtraArgument(context),
    store => next => action => {
      if (action.error) {
        console.log('Error intercepted:', action.error.message)
        console.log(action)
        store.dispatch(errorsActions.set(action))
      }
      
      return next(action)
    }
  ]
})
