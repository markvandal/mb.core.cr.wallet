
import { testsActions, authActions, recordActions } from '../../store'

import { wrapConextWithNewUser } from './helper'

export const testRecord = async (context, redux) => {
  const dispatch = redux.store.dispatch
  const _printRecord = (res) => {
    let record = res.payload?.loadedRecord || {}
    dispatch(testsActions.log(`Record info #${record.id}: ${record.key}: ${record.data} signed[${record.verified}]`))
  }
  try {
    dispatch(testsActions.startTest('Recrod test'))
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
    _printRecord(res)

    // Authenticate user and service with one another
    let _serviceId = null
    const serviceMnemonic = await wrapConextWithNewUser(context, redux, async (currentId, serviceId) => {
      res = await dispatch(authActions.request(currentId))
      console.log('Authenticate user', res)
      _serviceId = serviceId
    })

    res = await dispatch(authActions.sign(_serviceId))
    console.log('Sign authentication', res)
    dispatch(testsActions.log(`Authenticated service ${res.payload.service}`))

    await wrapConextWithNewUser(context, redux, async (currentId) => {
      // Create record from a service
      let res = await dispatch(recordActions.create({
        key: `web_service${Math.random()}`,
        data: 'data_from_web_service',
        publicity: context.value('PublicityType.PRIVATE', 'crsign'),
        type: context.value('RecordType.PROVIDER_RECORD', 'crsign'),
        identity: currentId
      }))
      console.log('Single record from a service created', res)
      dispatch(testsActions.log(`Record from a service created ${res.payload.id}`))
    }, serviceMnemonic)

    // Get list of records for current identity
    res = await dispatch(recordActions.loadAll())
    console.log('Records loaded', res)
    for (let i = 0; i < res.payload?.records?.length; ++i) {
      const itemRes = await dispatch(recordActions.load(res.payload.records[i]))
      console.log('Subrecord loading result', itemRes)
      _printRecord(itemRes)
    }

    // Get list of recrods of target identity
    await wrapConextWithNewUser(context, redux, async (currentId) => {
      const res = await dispatch(recordActions.loadAll(currentId))
      dispatch(testsActions.log(`Load target ${currentId} records ${res.payload?.records?.length}`))
      for (let i = 0; i < res.payload?.records?.length; ++i) {
        const itemRes = await dispatch(recordActions.load(res.payload.records[i]))
        console.log(`${currentId} Subrecord loading result`, itemRes)
        _printRecord(itemRes)

        // Seal reacord
        if ('RECORD_SEALED' !== itemRes.payload?.loadedRecord?.status) {
          console.log('try to seal')
          const sealRes = await dispatch(recordActions.update({
            id: itemRes.payload?.loadedRecord?.id,
            action: context.value(`RecordUpdate.REOCRD_UPDATE_SEAL`, 'crsign'),
          }))
          console.log('Record sealing result', sealRes)
          dispatch(testsActions.log(`(!) Record sealing result: ${sealRes.payload.status}`))
          _printRecord({ payload: { loadedRecord: sealRes.payload } })
        }
      }
    }, serviceMnemonic)
  } catch (e) {
    console.log(e)
    dispatch(testsActions.log(`Error during test ${e}`))
  }
}