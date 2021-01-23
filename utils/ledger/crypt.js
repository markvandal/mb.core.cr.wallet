import { encodeBech32Pubkey } from '@cosmjs/launchpad'
import { toBase64 } from '@cosmjs/encoding'

export const getBech32PubKey = (account) =>
  encodeBech32Pubkey({
    type: "tendermint/PubKeySecp256k1",
    value: toBase64(account.pubkey),
  }, 'metabelpub')