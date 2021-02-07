import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { v4 } from 'uuid'

import { createTx, createCurrentDate, encrypt } from '../utils'
import axios from 'axios'


const sign = createAsyncThunk(
  'auth/sign',
  async (idx, { extra: context, getState }) => {
    try {
      const auth = getState().auth.list[idx]

      console.log(auth)
      
      const tx = await createTx(
        context,
        context.getType('crsign.MsgConfirmAuth'),
        {
          service: auth.service,
          confirmationDt: createCurrentDate(),
        },
        context.wallet.address,
        {
          creatorField: 'identity',
          typeUrl: 'crsign.MsgConfirmAuth'
        }
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
    const _produceError = error => ({ newAuth: { error } })

    try {
      const key = v4()

      const url = context.config.getApiUrl(`metabelarus/mbcorecr/mbcorecr/id2addr/${identity}`)
      const body = (await axios.get(url)).data
      const accAddress = body.Addr?.address

      if (!accAddress) {
        return _produceError(`No address under specified id ${identity}`)
      }

      const account = (await axios.get(
        context.config.getApiUrl(`auth/accounts/${accAddress}`)
      )).data.result?.value

      if (!account) {
        return _produceError(`No account information under the address ${accAddress}`)
      }

      const encKey = encrypt(account.public_key?.value, key)
      if (!encKey) {
        return _produceError(`Can't get encrypted key with pubkey: ${account.public_key?.value}`)
      }

      const tx = await createTx(
        context,
        context.getType('crsign.MsgRequestAuth'),
        {
          identity,
          key: encKey,
          creationDt: createCurrentDate(),
        },
        context.wallet.address,
        {
          creatorField: 'service',
          typeUrl: 'crsign.MsgRequestAuth'
        }
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

      return _produceError(`${e}`)
    }
  }
)


const slice = createSlice({
  name: 'auth',

  initialState: {
    list: [],
    newAuth: null,
  },

  reducers: {
  },

  extraReducers: {
    [list.fulfilled]: (state, action) => {
      return { ...state, list: action.payload }
    },
    [load.fulfilled]: (state, action) => {
      const newState = [...state.list]
      newState[action.meta.arg] = action.payload

      return { ...state, list: newState }
    },
    [request.fulfilled]: (state, action) => {
      return { ...state, ...action.payload }
    },
    [sign.fulfilled]: (state, action) => {
      const newState = [...state.list]
      newState[action.meta.arg] = action.payload

      return { ...state, list: newState }
    }
  }
})


export const authActions = { ...slice.actions, list, load, request, sign }

export const auth = slice.reducer