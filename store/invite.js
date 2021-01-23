import axios from 'axios'
import { Type, Field } from 'protobufjs'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import * as bip39 from 'bip39'

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'

import { createTx } from '../utils/ledger/client'
import { createCurrentDate } from '../utils/date'


const create = createAsyncThunk(
  'invite/create',
  async ({level, type}, { extra: context }) => {
    const mnemonic = bip39.generateMnemonic()

    const tmpWallet = await DirectSecp256k1HdWallet.fromMnemonic(
      mnemonic,
      context.config.DEFAULT_WALLET_PATH,
      context.config.ADDR_PREFIX
    )

    const account = (await tmpWallet.getAccounts())[0];

    const tx = await createTx(
      context, 
      context.getType('metabelarus.mbcorecr.mbcorecr.MsgCreateInvite'),
      {
        identityType: type,
        level,
        address: account.address,
        pubKey: account.pubKey,
        creationDt: createCurrentDate(),
      },
      context.wallet.address,
      { 
        creatorField: 'inviter',
        typeUrl: '/metabelarus.mbcorecr.mbcorecr.MsgCreateInvite'
      }
    )

    const res = await tx.send()

    console.log(res)

    return {
      currentInvite: { 
        mnemonic,
        address: account.address,
        pubKey: account.pubkey // @TODO Convert to Bech32
      }
    }
  }
)

const slice = createSlice({
  name: 'invite',

  initialState: {
    currentInvite: null,
  },

  reducers: {
    update: (state, { payload }) => {
      return state
    },
  },

  extraReducers: {
    [create.fulfilled]: (state, action) => {
      return { ...state, ...action.payload }
    }
  }
})


export const inviteActions = {...slice.actions, create}

export const invite = slice.reducer