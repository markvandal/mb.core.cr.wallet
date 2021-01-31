
import { testsActions, walletActions, authActions } from '../../store'
import { testInvite } from './invite'

export const testAuth = async (context, redux) => {
  const dispatch = redux.store.dispatch

  await testInvite(context, redux)
  try {
    const backupMnemonic = redux.store.getState().wallet.mnemonic
    const currentId = redux.store.getState().wallet.identity.id

    const account = redux.store.getState().invite.newAccount
    let res = await dispatch(walletActions.openWithMnemoic(account.mnemonic))
    console.log('Result of opening of service account', res)
    dispatch(testsActions.log(`Opened service account session`))

    res = await dispatch(authActions.request(currentId))
    console.log('Requested auth result', res)
    dispatch(testsActions.log(`Requested auth ${res.payload.newAuth.authId} "${res.payload.newAuth.key}"`))

    res = await dispatch(walletActions.openWithMnemoic(backupMnemonic))
    console.log('Rollback to current account result', res)
    dispatch(testsActions.log(`Restored current sesstion`))
  } catch (e) {
    console.log(e)
    dispatch(testsActions.log(`Error during test ${e}`))
  }
}