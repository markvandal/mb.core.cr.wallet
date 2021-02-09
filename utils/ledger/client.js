import axios from 'axios'

import { SigningStargateClient } from '@cosmjs/stargate'
import { Registry } from '@cosmjs/proto-signing'


export const createTx = async (context, typeName, msg, meta = {}) => {
  const _meta = typeof meta === 'string' ? { creatorField: meta } : meta
  const fee = _meta.fee || {
    amount: [{ amount: '0', denom: 'token' }],
    gas: '200000'
  }
  const creatorField = _meta.creatorField || 'creator'
  const type = typeof typeName === 'string' ? context.getType(typeName) : typeName
  const _typeUrl = _meta.typeUrl || typeName

  return {
    sent: false,

    result: null,

    _result: null,

    msg: {
      typeUrl: `/${context.config.APP_PATH}.${_typeUrl}`,
      value: {
        ...msg,
      }
    },

    async send() {
      if (this.sent) return
      this.sent = true

      try {
        const client = await SigningStargateClient.connectWithSigner(
          context.config.RPC_URL,
          context.wallet,
          { registry: new Registry([[this.msg.typeUrl, type]]) }
        )

        return client.signAndBroadcast(msg[creatorField], [this.msg], fee)
          .then(result => {
            if (result.code) {
              console.log(result)

              throw new Error(result.rawLog)
            }

            return this.result = result
          })
          .then(result => this._result = _parseResult(result))

      } catch (e) {
        console.log(e)

        throw e
      }
    },

    checkResult(type, index = 0) {
      return this._result[index].type === type
    },

    getType(index = 0) {
      return this._result[index].type
    },

    getAttributes(index = 0) {
      return this._result[index].attributes
    },

    getAttribute(attr, index = 0) {
      return this._result[index].attributes[attr]
    }
  }
}

const _parseResult = (result) => {
  return JSON.parse(result.rawLog)[0]
    .events.map(event => ({
      type: event.type,
      attributes: event.attributes?.reduce((obj, attr) => ({ ...obj, [attr.key]: attr.value }), {}) || {}
    }))
}

export const loadAccountById = async (context, id) => {
  const body = await axios.get(
    context.config.getApiUrl(`metabelarus/mbcorecr/mbcorecr/id2addr/${id}`)
  )
  const identityAddress = body.data?.Addr?.address
  if (!identityAddress) {
    throw new Error(`Can't get identity address ${id}`)
  }

  return await loadAccount(context, identityAddress)
}

export const loadAccount = async (context, identityAddress) => {
  const account = (await axios.get(
    context.config.getApiUrl(`auth/accounts/${identityAddress}`)
  )).data?.result?.value
  if (!account) {
    throw new Error(`Can't load account with address ${identityAddress}`)
  }

  return account
}
