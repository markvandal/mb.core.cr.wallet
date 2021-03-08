import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { v4 } from 'uuid'

import { createTx, createCurrentDate, encrypt } from '../utils'
import axios from 'axios'


const sign = createAsyncThunk(
  'auth/sign',
  async (idx, { extra: context, getState }) => {
    try {
      const auth = typeof idx === 'number' ? getState().auth.list[idx] : { service: idx }

      const tx = await createTx(
        context,
        'crsign.MsgConfirmAuth',
        {
          identity: context.wallet.address,
          service: auth.service,
          confirmationDt: createCurrentDate(),
        },
        'identity',
      )

      await tx.send()

      if (!tx.checkResult('mbcorecr.crsign:confirm.auth')) {
        throw new Error(`Wrong confirm auth transction result: ${tx.getType()}`)
      }

      const idenity = getState().wallet.identity?.id
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/auths/${idenity}.${auth.service}`)
      const body = (await axios.get(url)).data

      return body.Auth
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)


const list = createAsyncThunk(
  'auth/list',
  async (_, { extra: context, getState }) => {
    try {
      const idenity = getState().wallet.identity?.id
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/id2services/${idenity}`)
      const body = (await axios.get(url)).data

      return Object.entries(body.Id2Service.services).map(([, value]) => value)
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const load = createAsyncThunk(
  'auth/load',
  async (idx, { extra: context, getState }) => {
    try {
      const service = getState().auth.list[idx]
      if ('string' !== typeof service) {
        throw new Error(`Already laoded for ${idx}`)
      }
      const idenity = getState().wallet.identity?.id
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/auths/${idenity}.${service}`)
      const body = (await axios.get(url)).data

      return body.Auth
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const request = createAsyncThunk(
  'auth/request',
  async (identity, { extra: context, getState }) => {
    try {
      const key = v4()

      const url = context.config.getApiUrl(`metabelarus/mbcorecr/mbcorecr/id2addr/${identity}`)
      const body = (await axios.get(url)).data
      const accAddress = body.Addr?.address

      if (!accAddress) {
        throw new Error(`No address under specified id ${identity}`)
      }

      const account = (await axios.get(
        context.config.getApiUrl(`auth/accounts/${accAddress}`)
      )).data.result?.value

      if (!account) {
        throw new Error(`No account information under the address ${accAddress}`)
      }

      const encKey = encrypt(account.public_key?.value, key)
      if (!encKey) {
        throw new Error(`Can't get encrypted key with pubkey: ${account.public_key?.value}`)
      }

      const tx = await createTx(
        context,
        'crsign.MsgRequestAuth',
        {
          service: context.wallet.address,
          identity,
          key: encKey,
          creationDt: createCurrentDate(),
        },
        'service'
      )

      await tx.send()

      if (!tx.checkResult('mbcorecr.crsign:request.auth')) {
        throw new Error(`Wrong request auth transction result: ${tx.getType()}`)
      }

      return {
        newAuth: {
          key,
          authId: tx.getAttribute('auth_id'),
        }
      }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)


const slice = createSlice({
  name: 'auth',

  initialState: {
    list: [],
    newAuth: null,
    loading: false,
  },

  reducers: {
  },

  extraReducers: {
    [list.pending]: (state) => {
      return { ...state, loading: true }
    },
    [list.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [list.fulfilled]: (state, action) => {
      return { ...state, list: action.payload, loading: false }
    },
    [load.pending]: (state) => {
      return { ...state, loading: true }
    },
    [load.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [load.fulfilled]: (state, action) => {
      const newState = [...state.list]
      newState[action.meta.arg] = action.payload

      return { ...state, list: newState, loading: false }
    },
    [request.pending]: (state) => {
      return { ...state, loading: true }
    },
    [request.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [request.fulfilled]: (state, action) => {
      return { ...state, ...action.payload, loading: false }
    },
    [sign.pending]: (state) => {
      return { ...state, loading: true }
    },
    [sign.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [sign.fulfilled]: (state, action) => {
      const newState = [...state.list]
      newState[action.meta.arg] = action.payload

      return { ...state, list: newState, loading: false }
    }
  }
})


export const authActions = { ...slice.actions, list, load, request, sign }

export const auth = slice.reducer