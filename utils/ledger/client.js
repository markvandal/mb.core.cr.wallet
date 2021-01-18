
import { SigningStargateClient } from '@cosmjs/stargate'

const client = await SigningStargateClient.connectWithWallet(
  RPC,
  wallet,
  {}
)