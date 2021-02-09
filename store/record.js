import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { createCurrentDate, createTx, sign, encrypt, decrypt, verify } from '../utils'

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
      let data = record.data
      if (record.recordType == context.value('PublicityType.PRIVATE', 'crsign')) {
        if (getState().wallet.identity.id === record.identity) {
          data = decrypt(context.wallet, record.data)
        }
      }
      let verified = null
      if (record.signature) {
        verified = await verify(context.wallet, record.signature, data)
      }
      record.verified = verified

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
   * @param { data, key, publicity?, type?, liveTime? } record 
   * @param { extra: context } param1 
   */
  async (record, { extra: context }) => {
    try {
      let data = record.data
      const signature = await sign(context.wallet, record.data)
      const publicity = record.publicity || context.value('PublicityType.PRIVATE', 'crsign')
      if (context.value('PublicityType.PRIVATE', 'crsign') === publicity) {
        data = encrypt(context.wallet.pubkey, data)
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
      let idx = 0
      if (idx = records.findIndex(_record => _record.id === record.id)) {
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
  }
})


export const recordActions = { ...slice.actions, create, load }

export const record = slice.reducer