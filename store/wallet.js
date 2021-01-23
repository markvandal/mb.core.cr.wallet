import axios from 'axios'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'


const openWithMnemoic = createAsyncThunk(
  'wallet/openWithMnemoic',
  async (mnemonic, { extra: context }) => {
    context.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic,
      context.config.DEFAULT_WALLET_PATH,
      context.config.ADDR_PREFIX
    )

    const account = (await axios.get(
      context.config.getApiUrl(`auth/accounts/${context.wallet.address}`)
    )).data

    context.client = await SigningStargateClient.connectWithSigner(
      context.config.RPC_URL,
      context.wallet,
      {}
    )

    return {
      address: wallet.address,
      account,
      mnemonic
    }
  }
)

const slice = createSlice({
  name: 'wallet',

  initialState: {
    address: null,
    account: null,
    mnemonic: null,
  },

  reducers: {
    update: (state, { payload }) => {
      return state
    },
  },

  extraReducers: {
    [openWithMnemoic.fulfilled]: (state, action) => {
      return { ...state, ...action.payload }
    }
  }
})


export const walletActions = {...slice.actions, openWithMnemoic}

export const wallet = slice.reducer