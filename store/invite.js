import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import * as bip39 from 'bip39'

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'

import { createTx } from '../utils/ledger/client'
import { createCurrentDate, getBech32PubKey } from '../utils'


const accept = createAsyncThunk(
  'invite/accept',
  async ({ mnemonic, inviteId }, { extra: context }) => {
    try {
      const tmpWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        context.config.DEFAULT_WALLET_PATH,
        context.config.ADDR_PREFIX
      )
      const tmpAccount = (await tmpWallet.getAccounts())[0]
      const tmpContext = { ...context, wallet: tmpWallet }

      const newMnemonic = bip39.generateMnemonic(256)

      const newWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        newMnemonic,
        context.config.DEFAULT_WALLET_PATH,
        context.config.ADDR_PREFIX
      )

      const newAccount = (await newWallet.getAccounts())[0];
      const newPubKey = getBech32PubKey(newAccount)

      const tx = await createTx(
        tmpContext,
        context.getType('mbcorecr.MsgAcceptInvite'),
        {
          inviteId,
          tmpAddress: tmpAccount.address,
          address: newAccount.address,
          pubKey: newPubKey,
          acceptanceDt: createCurrentDate(),
        },
        tmpWallet.address,
        {
          creatorField: 'inviteId',
          typeUrl: 'mbcorecr.MsgAcceptInvite'
        }
      )

      await tx.send()

      if (!tx.checkResult('mbcorecr:create.identity')) {
        throw new Error(`Wrong create identity transction result: ${tx.getType()}`)
      }

      return {
        newAccount: {
          mnemonic: newMnemonic,
          address: newAccount.address,
          pubKey: newPubKey,
          identityId: tx.getAttribute('identity_id'),
        }
      }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const create = createAsyncThunk(
  'invite/create',
  async ({ level, type }, { extra: context }) => {
    try {
      const mnemonic = bip39.generateMnemonic(128)

      const tmpWallet = await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        context.config.DEFAULT_WALLET_PATH,
        context.config.ADDR_PREFIX
      )

      const account = (await tmpWallet.getAccounts())[0];
      const bech32PubKey = getBech32PubKey(account)

      const tx = await createTx(
        context,
        context.getType('mbcorecr.MsgCreateInvite'),
        {
          identityType: type,
          level,
          address: account.address,
          pubKey: bech32PubKey,
          creationDt: createCurrentDate(),
        },
        context.wallet.address,
        {
          creatorField: 'inviter',
          typeUrl: 'mbcorecr.MsgCreateInvite'
        }
      )

      await tx.send()

      if (!tx.checkResult('mbcorecr:create.invite')) {
        throw new Error(`Wrong create invite transction result: ${tx.getType()}`)
      }

      return {
        currentInvite: {
          mnemonic,
          address: account.address,
          pubKey: bech32PubKey,
          inviteId: tx.getAttribute('invite_id'),
        }
      }
    } catch (e) {
      console.log(e)

      throw e
    }
  }
)

const slice = createSlice({
  name: 'invite',

  initialState: {
    currentInvite: null,
    newAccount: null,
  },

  reducers: {
    update: (state, { payload }) => {
      return state
    },
  },

  extraReducers: {
    [create.fulfilled]: (state, action) => {
      return { ...state, ...action.payload }
    },
    [create.rejected]: (state, action) => {
      return { ...state, currentInvite: null }
    },
    [accept.fulfilled]: (state, action) => {
      return { ...state, ...action.payload }
    },
    [accept.rejected]: (state, action) => {
      return { ...state, newAccount: null }
    },
  }
})


export const inviteActions = { ...slice.actions, create, accept }

export const invite = slice.reducer