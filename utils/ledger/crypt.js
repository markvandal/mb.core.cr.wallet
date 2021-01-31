import { encodeBech32Pubkey } from '@cosmjs/launchpad'
import { toBase64, fromBase64, toHex } from '@cosmjs/encoding'

import { decrypt as jsdecrypt, encrypt as jsencrypt, PrivateKey, PublicKey } from 'eciesjs'

export const getBech32PubKey = (account, context) =>
  encodeBech32Pubkey({
    type: "tendermint/PubKeySecp256k1",
    value: toBase64(account.pubkey),
  }, context.config.PUB_PREFIX)


export const decrypt = (wallet, data) => {
  try {
    return jsdecrypt(
      PrivateKey.fromHex(toHex(wallet.privkey)).toHex(),
      Buffer.from(fromBase64(fixBase64(data)))
    ).toString()
  } catch (e) {
    console.log(e)
  }

  return null
}


export const encrypt = (pubkey, data) => {
  try {
    return toBase64(jsencrypt(
      (new PublicKey(Buffer.from(pubkey, 'base64'))).compressed,
      Buffer.from(data)
    ))
  } catch (e) {
    console.log(e)
  }

  return null
}


const fixBase64 = (input) => {
  // Replace non-url compatible chars with base64 standard chars
  input = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Pad out with standard base64 required padding characters
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    input += new Array(5 - pad).join('=');
  }

  return input;
}