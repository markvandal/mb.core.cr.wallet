import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import * as bip39 from 'bip39'

import { createCurrentDate, getBech32PubKey, createTx } from '../utils'

import { createTmpContext } from '../utils/ledger/context'


const accept = createAsyncThunk(
  'invite/accept',
  async (sequence, { extra: context }) => {
    try {
      const [inviteId, ...mnemonics] = sequence.split(' ')
      const mnemonic = mnemonics.join(' ')

      const newMnemonic = bip39.generateMnemonic(256)

      const { tmpAccount, tmpContext, tmpWallet } = await createTmpContext(context, mnemonic)
      const { tmpAccount: newAccount } = await createTmpContext(context, newMnemonic)
      const newPubKey = getBech32PubKey(newAccount, context)

      const tx = await createTx(
        tmpContext,
        'mbcorecr.MsgAcceptInvite',
        {
          inviteId,
          tmpAddress: tmpAccount.address,
          address: newAccount.address,
          pubKey: newPubKey,
          acceptanceDt: createCurrentDate(),
        },
        'tmpAddress',
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

      const { tmpAccount: account } = await createTmpContext(context, mnemonic)
      const bech32PubKey = getBech32PubKey(account, context)

      const tx = await createTx(
        context,
        'mbcorecr.MsgCreateInvite',
        {
          inviter: context.wallet.address,
          identityType: type,
          level,
          address: account.address,
          pubKey: bech32PubKey,
          creationDt: createCurrentDate(),
        },
        'inviter',
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
    newInvite: {
      level: 'Level3',
      type: 'CITIZEN',
    },
  },

  reducers: {
    switchLevel: (state, { payload }) => {
      return { ...state, newInvite: { ...state.newInvite, level: payload } }
    },
    switchType: (state, { payload }) => {
      return { ...state, newInvite: { ...state.newInvite, type: payload } }
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