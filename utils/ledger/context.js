
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'


export const createTmpContext = async (context, mnemonic) => {
  const tmpWallet = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic,
    context.config.DEFAULT_WALLET_PATH,
    context.config.ADDR_PREFIX
  )
  const tmpAccount = (await tmpWallet.getAccounts())[0]
  const tmpContext = { ...context, wallet: tmpWallet }

  return { tmpWallet, tmpAccount, tmpContext }
}