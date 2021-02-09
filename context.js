
import { createContext } from 'react'

import { Root } from 'protobufjs'
import { Slip10RawIndex, stringToPath } from "@cosmjs/crypto";

import protoJson from './proto.json'


const ADDR_PREFIX = process.env.ADDR_PREFIX || 'metabel'
const APP_PATH = process.env.APP_PATH || 'metabelarus.mbcorecr'
const DEBUG_AUTH = process.env.DEBUG_AUTH || ''
const PUB_PREFIX = process.env.PUB_PREFIX || `${ADDR_PREFIX}pub`


console.log(process.env.DEFAULT_WALLET_PATH)
console.log(process.env.DEBUG_AUTH)

// Generate default wallet path
const DEFAULT_WALLET_PATH = process.env.DEFAULT_WALLET_PATH
  ? stringToPath(process.env.DEFAULT_WALLET_PATH)
  : [
    Slip10RawIndex.hardened(44),
    Slip10RawIndex.hardened(118),
    Slip10RawIndex.hardened(0),
    Slip10RawIndex.normal(0),
    Slip10RawIndex.normal(0),
  ]

const COSTOM_URL = process.env.CUSTOM_URL && new URL(process.env.CUSTOM_URL)

const API_URL =
  (COSTOM_URL && `${COSTOM_URL.protocol}//1317-${COSTOM_URL.hostname}`) ||
  process.env.API_URL || 'http://0.0.0.0:1317'
const RPC_URL =
  (COSTOM_URL && `${COSTOM_URL.protocol}//26657-${COSTOM_URL.hostname}`) ||
  process.env.RPC_URL || 'http://0.0.0.0:26657'
const WS_URL =
  (process.env.TENDERMINT_URL && process.env.TENDERMINT_URL.replace('0.0.0.0', 'localhost')) ||
  (COSTOM_URL && `wss://26657-${COSTOM_URL.hostname}/websocket`) || 'ws://localhost:26657/websocket'


const protoRoot = Root.fromJSON(protoJson)

export const context = {
  wallet: null,

  client: null,

  config: {
    COSTOM_URL,
    API_URL,
    RPC_URL,
    ADDR_PREFIX,
    DEFAULT_WALLET_PATH,
    WS_URL,
    APP_PATH,
    DEBUG_AUTH,
    PUB_PREFIX,

    getApiUrl(uri) {
      return `${this.API_URL}/${uri}`
    }
  },

  getType(typePath) {
    return protoRoot.lookupType(`${this.config.APP_PATH}.${typePath}`)
  },

  getEnum(typePath) {
    return protoRoot.lookupEnum(`${this.config.APP_PATH}.${typePath}`)
  },

  value(code, module = 'mbcorecr') {
    const [type, key] = code.split('.')

    return this.getEnum(`${module}.${type}`).values[key]
  },

  key(type, id) {
    return this.getEnum(`mbcorecr.${type}`).valuesById[id]
  },

  selectFunction: (_, nav) => {
    nav.navigate('main')
  }
}

export const Context = createContext(context)