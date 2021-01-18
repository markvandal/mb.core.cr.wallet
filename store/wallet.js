import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'

import { context } from '../context'

import {
  Slip10RawIndex,
} from "@cosmjs/crypto";


const ADDR_PREFIX = 'metabel'
const DEFAULT_WALLET_PATH = 0

const registerWithMnemoic = createAsyncThunk(
  'wallet/registerWithMnemonic',
  async (mnemonic, thunkAPI) => {
    context.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic,
      [Slip10RawIndex.hardened(DEFAULT_WALLET_PATH)],
      ADDR_PREFIX
    )
  }
)

const slice = createSlice({
  name: 'wallet',

  initialState: {
    
  },

  reducers: {
    update: (state, { payload }) => {
      return state
    },
  },

  extraReducers: {
    [registerWithMnemoic.fulfilled]: (state, action) => {
      return state
    }
  }
})


export const walletActions = {...slice.actions, registerWithMnemoic}

export const wallet = slice.reducer