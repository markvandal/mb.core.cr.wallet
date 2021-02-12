import { testsActions, walletActions } from '../../store'
import { testInvite } from './invite'

export const wrapConextWithNewUser = async (context, redux, callback, mnemonic = null) => {
  const dispatch = redux.store.dispatch
  const backupMnemonic = redux.store.getState().wallet.mnemonic
  const currentId = redux.store.getState().wallet.identity.id

  if (!mnemonic) {
    await testInvite(context, redux)
    const account = redux.store.getState().invite.newAccount
    mnemonic = account.mnemonic
  }
  let res = await dispatch(walletActions.openWithMnemoic(mnemonic))
  console.log('Result of opening of service account', res)
  dispatch(testsActions.log(`Opened service account session`))

  await callback(currentId, res.payload.identity.id)

  res = await dispatch(walletActions.openWithMnemoic(backupMnemonic))
  console.log('Rollback to current account result', res)
  dispatch(testsActions.log(`Restored current sesstion`))

  return mnemonic
}