
import { Type, Field } from 'protobufjs'
import { SigningStargateClient } from '@cosmjs/stargate'
import { Registry } from '@cosmjs/proto-signing'


export const createTx = async (context, type, msg, address = undefined, meta = {}) => {
  const fee = meta.fee || {
    amount: [{ amount: '0', denom: 'token' }],
    gas: '200000'
  }

  const _address = address || meta.address

  return {
    sent: false,

    result: null,

    _result: null,

    msg: {
      typeUrl: `/${context.config.APP_PATH}.${meta.typeUrl}`,
      value: {
        [meta.creatorField || 'creator']: _address,
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

        return client.signAndBroadcast(_address, [this.msg], fee)
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

const _parseResult = (result) => JSON.parse(result.rawLog)[0]
  .events.map(event => ({
    type: event.type,
    attributes: event.attributes.reduce((obj, attr) => ({...obj, [attr.key]: attr.value}), {})
  })
)
