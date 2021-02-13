
import { inviteActions, testsActions } from '../../store'

export const testInvite = async (context, redux, mainTest = true) => {
  const dispatch = redux.store.dispatch
  
  try {
    if (mainTest) {
      dispatch(testsActions.startTest('Invite test'))
    }
    let res = await dispatch(inviteActions.create({
      type: context.value('IdentityType.SERVICE'), 
      level: context.value('IdentityLevel.Level0')
    }))
    console.log('Invite result', res)
    const invite = res.payload.currentInvite
    const type = context.key('IdentityType', res.meta.arg.type)
    const level = context.key('IdentityLevel', res.meta.arg.level)
    
    dispatch(testsActions.log(`Invite created ${invite.inviteId} ${type} ${level}`))
    

    res = await dispatch(inviteActions.accept(`${invite.inviteId} ${invite.mnemonic}`))
    console.log('Invite accepted result', res)
    const newAccount = res.payload.newAccount

    dispatch(testsActions.log(`Account created ${newAccount.identityId} ${newAccount.mnemonic}`))
  } catch (e) {
    console.log(e)
    dispatch(testsActions.log(`Error during test ${e}`))
  }
}