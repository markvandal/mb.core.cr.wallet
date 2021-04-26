import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { createCurrentDate, createTx, sign, encrypt, decrypt, verify, loadAccount, loadAccountById } from '../utils'

const loadAll = createAsyncThunk(
  'reocrd/loadAll',
  async (identity, { extra: context, getState }) => {
    if (!identity) {
      identity = getState().wallet.identity.id
    }
    const url = context.config.getApiUrl(`/metabelarus/mbcorecr/crsign/id2record/${identity}`)
    const body = (await axios.get(url)).data
    if (!body.Id2Record) {
      throw new Error(`Can't load records for Identity: ${identity}`)
    }

    return { records: body.Id2Record.records }
  }
)

const load = createAsyncThunk(
  'record/load',
  async (recordId, { extra: context, getState }) => {
    try {
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/records/${recordId}`)
      const body = (await axios.get(url)).data

      if (!body.Record) {
        throw new Error(`Can't load reacord with ID: ${recordId}`)
      }
      const record = body.Record
      await _patchRecord(context, getState().wallet.identity.id, record)

      return { loadedRecord: record }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const validate = createAsyncThunk(
  'record/validate',
  async ({ record, value }, { extra: context, getState }) => {
    try {
      const _record = { ...record }
      const account = await loadAccountById(
        context,
        record.recordType === 'IDENTITY_RECORD' ? record.identity : record.provider
      )
      const pubkey = account.public_key.value
      _record.verified = await verify(pubkey, record.signature, value)
      if (_record.verified) {
        _record.data = value
      }

      return _record
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const _patchRecord = async (context, currentIdentity, record) => {
  if (record.data && record.publicity === 'PRIVATE') {
    if (currentIdentity === record.identity) {
      record.data = decrypt(context.wallet, record.data)
    }
  }
  record.verified = null
  if (['PRIVATE', 'PUBLIC'].includes(record.publicity) && record.signature) {
    let pubkey = context.wallet.pubkey
    if (currentIdentity != record.provider) {
      const account = await loadAccountById(context, record.provider)
      pubkey = account.public_key.value
    }
    try {
      record.verified = await verify(pubkey, record.signature, record.data)
    } catch (e) {
      console.log(e)
    }
  }
}

const update = createAsyncThunk(
  'record/update',
  /**
   * 
   * @param {id, action, data?, key?, fieldFormat?, validationErrorText?, liveTime?} record 
   */
  async (record, { extra: context, getState }) => {
    try {
      if (!record.fieldFormat.test(record.data)) {
        throw new Error(record.validationErrorText)
      }

      const currentIdentity = getState().wallet.identity.id
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/records/${record.id}`)
      const _record = (await axios.get(url)).data?.Record      

      if (!_record) {
        throw new Error(`No record with id ${record.id}`)
      }

      const updateExtension = {}

      if (record.data && currentIdentity === _record.provider) {
        if (_record.publicity === 'PRIVATE') {
          let pubkey = context.wallet.pubkey
          if (_record.identity != getState().wallet.identity.id) {
            const account = await loadAccountById(context, _record.identity)
            pubkey = account.public_key.value
          }

          updateExtension.data = encrypt(pubkey, record.data)
        } else {
          updateExtension.data = record.data
        }

        updateExtension.signature = await sign(context.wallet, record.data)
      } else {
        updateExtension.data = _record.data
        updateExtension.signature = _record.signature
      }

      if (record.liveTime !== null && record.liveTime !== undefined) {
        updateExtension.liveTime = record.liveTime
      }

      const tx = await createTx(
        context,
        'crsign.MsgUpdateRecord',
        {
          updater: context.wallet.address,
          id: record.id,
          action: record.action,
          updateDt: createCurrentDate(),
          ...updateExtension
        },
        'updater'
      )

      await tx.send()

      if (!tx.checkResult('mbcorecr.crsign:update.record')) {
        throw new Error(`Wrong update record transction result: ${tx.getType()}`)
      }

      const recordReloaded = (await axios.get(url)).data?.Record
      await _patchRecord(context, currentIdentity, recordReloaded)

      return recordReloaded
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const create = createAsyncThunk(
  'record/create',
  /**
   * 
   * @param { data, key, publicity?, type?, liveTime?, identity?, fieldFormat?, validationErrorText? } record 
   */
  async (record, { extra: context, getState }) => {
    try {
      let data = record.data
      const providerAddon = {}
      if (record.fieldFormat) {
        if (!record.fieldFormat.test(record.data)) {
          throw new Error(record.validationErrorText)
        }
      }
      const signature = await sign(context.wallet, record.data)
      const publicityPrivateVal = context.value('PublicityType.PRIVATE', 'crsign')
      const publicity = record.publicity || publicityPrivateVal
      const recordType = record.type || (
        record.identity && getState().wallet?.identity?.id != record.identity
          ? context.value('RecordType.PROVIDER_RECORD', 'crsign')
          : context.value('RecordType.IDENTITY_RECORD', 'crsign')
      )

      if (
        [
          context.value('RecordType.PROVIDER_RECORD', 'crsign'),
          context.value('RecordType.PROVIDER_SIGNABLE_RECORD', 'crsign'),
          context.value('RecordType.PROVIDER_PERMISSION', 'crsign'),
        ].includes(recordType)
        && getState().wallet.identity.identityType !== 'SERVICE') {
        throw new Error(`Only service can create provided records`)
      }

      let pubkey = context.wallet.pubkey
      if (record.identity) {
        providerAddon.provider = record.identity
        const account = await loadAccountById(context, record.identity)
        pubkey = account.public_key.value
      }

      if (publicityPrivateVal === publicity) {
        data = encrypt(pubkey, data)
      }

      const tx = await createTx(
        context,
        'crsign.MsgCreateRecord',
        {
          creator: context.wallet.address,
          key: record.key,
          data,
          signature,
          recordType,
          publicity,
          liveTime: record.liveTime || 0,
          creationDt: createCurrentDate(),
          ...providerAddon
        },
      )

      await tx.send()

      if (!tx.checkResult('mbcorecr.crsign:create.record')) {
        throw new Error(`Wrong create record transction result: ${tx.getType()}`)
      }

      const recordId = tx.getAttribute('record_id')

      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/records/${recordId}`)
      const body = (await axios.get(url)).data

      return { createdRecord: { ...body.Record, verified: true } }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)


const slice = createSlice({
  name: 'record',

  initialState: {
    records: [],
    createdRecord: null,
    loadedRecord: null,
    loading: false,
    newRecord: {
      publicity: 'PRIVATE',
      type: null,
    },
  },

  reducers: {
    switchPublicity: (state, { payload }) => {
      return { ...state, newRecord: { ...state.newRecord, publicity: payload } }
    },
    switchType: (state, { payload }) => {
      return { ...state, newRecord: { ...state.newRecord, type: payload } }
    },
  },

  extraReducers: {
    [create.pending]: (state) => {
      return { ...state, loading: true }
    },
    [create.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [create.fulfilled]: (state, { payload }) => {
      return { ...state, ...payload, loading: false }
    },
    [load.pending]: (state) => {
      return { ...state, loading: true }
    },
    [load.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [load.fulfilled]: (state, { payload }) => {
      const record = payload.loadedRecord

      return _addRecord(state, record)
    },
    [update.pending]: (state) => {
      return { ...state, loading: true }
    },
    [update.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [update.fulfilled]: (state, { payload: record }) => {
      return _addRecord(state, record)
    },
    [validate.pending]: (state) => {
      return { ...state, loading: true }
    },
    [validate.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [validate.fulfilled]: (state, { payload: record }) => {
      return _addRecord(state, record)
    },
    [loadAll.pending]: (state) => {
      return { ...state, loading: true }
    },
    [loadAll.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [loadAll.fulfilled]: (state, { payload: { records } }) => {
      return { ...state, records, loading: false }
    },
  }
})

const _addRecord = (state, record) => {
  let records = [...state.records]
  const idx = records.findIndex(_record => _record.id === record.id || _record === record.id)
  if (idx !== -1) {
    records[idx] = record
  } else {
    records.push(record)
  }

  return {
    ...state,
    records,
    loadedRecord: record,
    loading: false,
  }
}


export const recordActions = { ...slice.actions, create, load, loadAll, update, validate }

export const record = slice.reducer