import chai, { expect } from 'chai'
import { Contract, Wallet, providers } from 'ethers'
import { solidity, deployContract } from 'ethereum-waffle'

import Beat from '../build/Beat.json'
import Timelock from '../build/Timelock.json'
import Governor from '../build/Governor.json'

import { DELAY } from './utils'

chai.use(solidity)

interface GovernanceFixture {
  beat: Contract
  timelock: Contract
  governor: Contract
}

export async function governanceFixture(
  [wallet]: Wallet[],
  provider: providers.Web3Provider
): Promise<GovernanceFixture> {
  // deploy UNI, sending the total supply to the deployer
  const { timestamp: now } = await provider.getBlock('latest')
  const timelockAddress = Contract.getContractAddress({ from: wallet.address, nonce: 1 })
  const beat = await deployContract(wallet, Beat, [wallet.address, timelockAddress, now + 60 * 60])

  // deploy timelock, controlled by what will be the governor
  const governorAddress = Contract.getContractAddress({ from: wallet.address, nonce: 2 })
  const timelock = await deployContract(wallet, Timelock, [governorAddress, DELAY])
  expect(timelock.address).to.be.eq(timelockAddress)

  // deploy governorAlpha
  const governor = await deployContract(wallet, Governor, [timelock.address, beat.address])
  expect(governor.address).to.be.eq(governorAddress)

  return { beat, timelock, governor }
}
