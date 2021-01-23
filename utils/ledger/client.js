
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

async function _() {
  if (this.valid && !this.flight && this.hasAddress) {
    const { RPC } = this.$store.state.cosmos.env.env
    const wallet = this.$store.getters['cosmos/wallet']
    const account = this.$store.getters['cosmos/account']
    const from_address = account.address
    const type = this.type.charAt(0).toUpperCase() + this.type.slice(1)
    const typeUrl = `/${this.path}.MsgCreate${type}`
    let MsgCreate = new Type(`MsgCreate${type}`)
    this.fields.forEach(f => {
      MsgCreate = MsgCreate.add(new Field(f[0], f[1], f[2]))
    })
    const registry = new Registry([[typeUrl, MsgCreate]])
    const client = await SigningStargateClient.connectWithWallet(
      RPC,
      wallet,
      { registry }
    )
    const msg = {
      typeUrl,
      value: {
        creator: from_address,
        ...this.fieldsList
      }
    }
    const fee = {
      amount: [{ amount: '0', denom: 'token' }],
      gas: '200000'
    }
    this.flight = true
    try {
      const path = this.path.replace(/\./g, '/')
      await client.signAndBroadcast(from_address, [msg], fee)
      this.$store.dispatch('cosmos/entityFetch', {
        type: this.type,
        path: path
      })
    } catch (e) {
      console.log(e)
    }
    this.flight = false
    Object.keys(this.fieldsList).forEach(f => {
      this.fieldsList[f] = ''
    })
  }
}