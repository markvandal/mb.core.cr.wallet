import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import * as bip39 from 'bip39'

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'

import axios from 'axios'
import { createTx } from '../utils/ledger/client'
import { createCurrentDate, getBech32PubKey } from '../utils'

const list = createAsyncThunk(
  'auth/list',
  async (_, { extra: context }) => {
    try {
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/id2services/6`)
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
      const service = getState().auth[idx]
      const url = context.config.getApiUrl(`metabelarus/mbcorecr/crsign/auths/6.${service}`)
      const body = (await axios.get(url)).data

      return body.Auth
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)


const slice = createSlice({
  name: 'auth',

  initialState: [],

  reducers: {
  },

  extraReducers: {
    [list.fulfilled]: (_, action) => {
      return [...action.payload]
    },
    [load.fulfilled]: (state, action) => {
      const newState = [...state]
      newState[action.meta.arg] = action.payload

      return newState
    },
  }
})


export const authActions = { ...slice.actions, list, load }

export const auth = slice.reducer