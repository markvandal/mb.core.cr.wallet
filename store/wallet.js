import axios from 'axios'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'


const open = createAsyncThunk(
  'wallet/open',
  async (identityId, { extra: context }) => {
    try {
      const identity = (await axios.get(
        context.config.getApiUrl(`metabelarus/mbcorecr/mbcorecr/identity/${identityId}`)
      )).data?.Identity

      if (!identity) {
        throw new Error(`There is no identity with ID ${identityId}`)
      }

      return { targetIdentity: identity }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)


const openWithMnemoic = createAsyncThunk(
  'wallet/openWithMnemoic',
  async (mnemonic, { extra: context }) => {
    try {
      context.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        context.config.DEFAULT_WALLET_PATH,
        context.config.ADDR_PREFIX
      )

      const account = (await axios.get(
        context.config.getApiUrl(`auth/accounts/${context.wallet.address}`)
      )).data

      const addr2id = (await axios.get(
        context.config.getApiUrl(`metabelarus/mbcorecr/mbcorecr/addr2id/${context.wallet.address}`)
      )).data

      let identity = null
      if (addr2id.Addr2Id?.id) {
        identity = (await axios.get(
          context.config.getApiUrl(`metabelarus/mbcorecr/mbcorecr/identity/${addr2id.Addr2Id?.id}`)
        )).data?.Identity
      }

      context.client = await SigningStargateClient.connectWithSigner(
        context.config.RPC_URL,
        context.wallet,
        {}
      )

      return {
        address: context.wallet.address,
        account: account.result?.value,
        identity,
        mnemonic
      }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const slice = createSlice({
  name: 'wallet',

  initialState: {
    address: null,
    account: null,
    mnemonic: null,
    identity: null,
    targetIdentity: null,
    loading: false,
  },

  reducers: {
    signOut: (state) => {
      return { ...state, address: '', account: '', mnemonic: '', identity: null, targetIdentity: null, }
    },
  },

  extraReducers: {
    [openWithMnemoic.pending]: (state) => {
      return { ...state, loading: true }
    },
    [openWithMnemoic.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [openWithMnemoic.fulfilled]: (state, action) => {
      return { ...state, ...action.payload, loading: false }
    },
    [open.pending]: (state) => {
      return { ...state, loading: true }
    },
    [open.rejected]: (state) => {
      return { ...state, loading: false }
    },
    [open.fulfilled]: (state, { payload }) => {
      return { ...state, ...payload, loading: false }
    }
  }
})


export const walletActions = { ...slice.actions, openWithMnemoic, open }

export const wallet = slice.reducer