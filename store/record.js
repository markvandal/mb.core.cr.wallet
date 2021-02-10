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
      const currentIdentity = getState().wallet.identity.id
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/records/${recordId}`)
      const body = (await axios.get(url)).data

      if (!body.Record) {
        throw new Error(`Can't load reacord with ID: ${recordId}`)
      }
      const record = body.Record
      if (record.publicity === 'PRIVATE') {
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
        record.verified = await verify(pubkey, record.signature, record.data)
      }

      return { loadedRecord: record }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const create = createAsyncThunk(
  'record/create',
  /**
   * @param { data, key, publicity?, type?, liveTime?, identity? } record 
   * @param { extra: context } param1 
   */
  async (record, { extra: context }) => {
    try {
      let data = record.data
      const providerAddon = {}
      const signature = await sign(context.wallet, record.data)
      const publicityPrivateVal = context.value('PublicityType.PRIVATE', 'crsign')
      const publicity = record.publicity || publicityPrivateVal
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
          recordType: record.type || context.value('RecordType.IDENTITY_RECORD', 'crsign'),
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
  },

  reducers: {
  },

  extraReducers: {
    [create.fulfilled]: (state, { payload }) => {
      return { ...state, ...payload }
    },
    [load.fulfilled]: (state, { payload }) => {
      const record = payload.loadedRecord

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
      }
    },
    [loadAll.fulfilled]: (state, { payload: { records } }) => {
      return { ...state, records }
    },
  }
})


export const recordActions = { ...slice.actions, create, load, loadAll }

export const record = slice.reducer