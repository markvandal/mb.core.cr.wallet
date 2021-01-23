
// @TODO Make builder?, push through react context functionality
import { Root } from 'protobufjs'
import { Slip10RawIndex } from "@cosmjs/crypto";

import protoJson from './proto.json'


const ADDR_PREFIX = process.env.ADDR_PREFIX || 'metabel'
const DEFAULT_WALLET_PATH = [Slip10RawIndex.hardened(0)]

const GITPOD =
  process.env.CUSTOM_URL && new URL(process.env.CUSTOM_URL)
  
console.log(process.env.CUSTOM_URL)
console.log(GITPOD)

const API_URL =
	(GITPOD && `${GITPOD.protocol}//1317-${GITPOD.hostname}`) ||
	process.env.API_URL || 'http://0.0.0.0:1317'
const RPC_URL =
	(GITPOD && `${GITPOD.protocol}//26657-${GITPOD.hostname}`) ||
  process.env.RPC_URL || 'http://0.0.0.0:26657'
const WS_URL =
  (process.env.TENDERMINT_URL && process.env.TENDERMINT_URL.replace('0.0.0.0', 'localhost')) ||
  (GITPOD && `wss://26657-${GITPOD.hostname}/websocket`) || 'ws://localhost:26657/websocket'


const protoRoot = Root.fromJSON(protoJson)

export const context = {
  wallet: null,

  client: null,

  config: {
    GITPOD,
    API_URL,
    RPC_URL,
    ADDR_PREFIX,
    DEFAULT_WALLET_PATH,
    WS_URL,

    getApiUrl(uri) {
      return `${this.API_URL}/${uri}`
    }
  },

  getType(typePath) {
    return protoRoot.lookupType(typePath)
  }
} 