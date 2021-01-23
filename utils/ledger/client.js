
import { Type, Field } from 'protobufjs'
import { SigningStargateClient } from '@cosmjs/stargate'
import { Registry } from '@cosmjs/proto-signing'


export const createType = (name, fields) => {
  return fields.reduce(
    (type, field, index) => type.add(new Field(
      field.name,
      field.id !== undefined ? field.id : index,
      field.type || 'string',
      field.rule,
      field.extend,
      field.options
    )), new Type(name)
  )
}

export const createTx = async (context, type, msg, address = undefined, meta = {}) => {
  const fee = meta.fee || {
    amount: [{ amount: '0', denom: 'token' }],
    gas: '200000'
  }

  const _address = address || meta.address

  return {
    sent: false,

    result: null,

    msg: {
      typeUrl: meta.typeUrl,
      value: {
        [meta.creatorField || 'creator']: _address,
        ...msg,
      }
    },

    async send() {
      if (this.sent) return
      this.sent = true

      const client = await SigningStargateClient.connectWithSigner(
        context.config.RPC_URL,
        context.wallet,
        { registry: new Registry([[meta.typeUrl, type]]) }
      )

      const res = await client.signAndBroadcast(_address, [this.msg], fee)
        .then(result => this.result = result )

      return res
    }
  }
}

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