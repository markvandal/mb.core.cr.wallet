import { encodeBech32Pubkey, encodeSecp256k1Signature } from '@cosmjs/launchpad'
import { toBase64, fromBase64, toHex, fromHex } from '@cosmjs/encoding'
import { Secp256k1, sha256, Secp256k1Signature } from '@cosmjs/crypto'

import { decrypt as jsdecrypt, encrypt as jsencrypt, PrivateKey, PublicKey } from 'eciesjs'


export const getBech32PubKey = (account, context) =>
  encodeBech32Pubkey({
    type: "tendermint/PubKeySecp256k1",
    value: toBase64(account.pubkey),
  }, context.config.PUB_PREFIX)


export const decrypt = (wallet, data) => {
  try {
    return jsdecrypt(
      toHex(wallet.privkey),
      Buffer.from(fromBase64(fixBase64(data)))
    ).toString()
  } catch (e) {
    console.log(e)
  }

  return null
}

export const sign = async (wallet, data) => {
  const signature = await Secp256k1.createSignature(
    sha256(Uint8Array.from(Buffer.from(data))), 
    wallet.privkey
  )
  const sign = encodeSecp256k1Signature(
    wallet.pubkey, 
    new Uint8Array([...signature.r(32), ...signature.s(32)])
  )

  return toHex(fromBase64(sign.signature))
}

export const verify = async (pubkey, signature, data) => {
  pubkey = typeof pubkey === 'string' ? fromBase64(pubkey) : pubkey
  const _signature = fromHex(signature)
  return await Secp256k1.verifySignature(
    new Secp256k1Signature(_signature.slice(0,32), _signature.slice(32)),
    sha256(Uint8Array.from(Buffer.from(data))),
    pubkey,
  )
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