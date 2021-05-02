
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

    defaultRecords: [
      {
        key: 'mb.citizen.self.firstname',
        label: 'Имя',
        fieldFormat: /^[a-zA-Z]+$/,
        validationErrorText: 'Имя заполняется буквами латинского алфавита',
        types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      },
      {
        key: 'mb.citizen.self.lastname',
        label: 'Фамилия',
        fieldFormat: /^[a-zA-Z]+$/,
        validationErrorText: 'Фамилия заполняется буквами латинского алфавита',
        types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      },
      {
        key: 'mb.citizen.self.personalnumber',
        label: 'Личный номер',
        fieldFormat: /^[0-9A-Z]{8,20}$/,
        validationErrorText: 'Личный номер имеет некорректный формат',
        types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      },
      {
        key: 'mb.citizen.self.citizenship',
        label: 'Гражданство',
        fieldFormat: /\S[ A-Za-z]/,
        validationErrorText: 'Гражданство заполняется буквами латинского алфафита',
        types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
        defaults: {
          CITIZEN: 'Republic of Belarus',
        }
      },
      // {
      //   key: 'mb.citizen.self.birthplace',
      //   label: 'Место рождения',
      //   fieldFormat: /^\S[a-zA-Zа-яА-Я ]*$/,
      //   validationErrorText: 'Field must contain only letters',
      //   types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      // },
      {
        key: 'mb.citizen.self.birthdate',
        label: 'Дата рождения',
        fieldFormat: /^(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}$/,
        validationErrorText: 'Дата рождения должна иметь формат ДД.ММ.ГГГГ',
        types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      },
      // {
      //   key: 'mb.citizen.self.phonenumber',
      //   label: 'Мобильный номер',
      //   types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      //   restrictions: ['REOCRD_UPDATE_SEAL'],
      // },
      // {
      //   key: 'mb.citizen.self.email',
      //   label: 'Электронная почта',
      //   types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      //   restrictions: ['REOCRD_UPDATE_SEAL'],
      // },
      // {
      //   key: 'mb.citizen.self.telegram',
      //   label: 'Телеграм',
      //   types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      //   restrictions: ['REOCRD_UPDATE_SEAL'],
      // },
      // {
      //   key: 'mb.citizen.self.social',
      //   label: 'Профиль в соц. сети',
      //   types: ['CITIZEN', 'FOREIGNER', 'DIASPORA_MEMBER'],
      //   restrictions: ['REOCRD_UPDATE_SEAL'],
      // },
    ],

    _defaultRecordKeys: null,

    listDefaultRecords() {
      if (!this._defaultRecordKeys) {
        this._defaultRecordKeys = this.defaultRecords.map(record => record.key)
      }

      return this._defaultRecordKeys
    },

    getRecordSettingByKey(key) {
      return this.defaultRecords.find((setting) => setting.key === key)
    },

    getValidation(key) {
      return {
        fieldFormat: this.defaultRecords.find((setting) => setting.key === key).fieldFormat,
        validationErrorText: this.defaultRecords.find((setting) => setting.key === key).validationErrorText
      }
    },

    isDefaultRecord(key) {
      return this.listDefaultRecords().includes(key)
    },

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

  key(type, id, module = 'mbcorecr') {
    return this.getEnum(`${module}.${type}`).valuesById[id]
  },

  selectFunction: (_, nav) => {
    nav.navigate('main')
  }
}

export const Context = createContext(context)