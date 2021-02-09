
import { testsActions, walletActions, authActions, recordActions } from '../../store'

export const testRecord = async (context, redux) => {
  const dispatch = redux.store.dispatch

  try {
    // Create sealed record
    let res = await dispatch(recordActions.create({
      key: `web_record${Math.random()}`,
      data: 'some_value_to_encrypt',
    }))
    console.log('Result of private record creation', res)
    dispatch(testsActions.log(`Created a self-signed private record`))
    // Receive record from server
    res = await dispatch(recordActions.load(res.payload.createdRecord.id))
    console.log('Record loading result', res)

    // Get list of records for current identity

    // Get list of recrods of target identity
  } catch (e) {
    console.log(e)
    dispatch(testsActions.log(`Error during test ${e}`))
  }
}