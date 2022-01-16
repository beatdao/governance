import chai, { expect } from 'chai'
import { Contract, constants } from 'ethers'
import { solidity, MockProvider, createFixtureLoader } from 'ethereum-waffle'

import { governanceFixture } from './fixtures'
import { DELAY } from './utils'

chai.use(solidity)

describe('Governor', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })
  const [wallet] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet], provider)

  let beat: Contract
  let timelock: Contract
  let governor: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(governanceFixture)
    beat = fixture.beat
    timelock = fixture.timelock
    governor = fixture.governor
  })

  it('beat', async () => {
    const balance = await beat.balanceOf(wallet.address)
    const totalSupply = await beat.totalSupply()
    expect(balance).to.be.eq(totalSupply)
  })

  it('timelock', async () => {
    const admin = await timelock.admin()
    expect(admin).to.be.eq(governor.address)
    const pendingAdmin = await timelock.pendingAdmin()
    expect(pendingAdmin).to.be.eq(constants.AddressZero)
    const delay = await timelock.delay()
    expect(delay).to.be.eq(DELAY)
  })

  it('governor', async () => {
    const votingPeriod = await governor.votingPeriod()
    expect(votingPeriod).to.be.eq(40320)
    const timelockAddress = await governor.timelock()
    expect(timelockAddress).to.be.eq(timelock.address)
    // const uniFromGovernor = await governor.beat()
    // expect(uniFromGovernor).to.be.eq(uni.address)
  })
})
