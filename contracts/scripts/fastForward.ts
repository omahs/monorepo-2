/* eslint-disable @typescript-eslint/camelcase */
import fs from 'fs'
import { network, ethers } from 'hardhat'

async function main() {
  if (network.name !== 'localhost') {
    console.log(
      'this script is only for testing purposes and should only run on localhost'
    )
    return
  }

  const stateStr = fs.readFileSync('state.json').toString()
  const state = JSON.parse(stateStr)
  const fundingRoundAddress = state.fundingRound

  const [signer] = await ethers.getSigners()
  const fundingRound = await ethers.getContractAt(
    'FundingRound',
    fundingRoundAddress,
    signer
  )
  console.log('funding round address', fundingRound.address)
  const maciAddress = await fundingRound.maci()
  console.log('maci address', maciAddress)

  const maci = await ethers.getContractAt('MACI', maciAddress, signer)
  const signUpDuration = await maci.signUpDurationSeconds()
  const votingDuration = await maci.votingDurationSeconds()
  console.log('signUpDuration', signUpDuration.toString())
  console.log('votingDuration', votingDuration.toString())

  const totalDuration = signUpDuration.add(votingDuration).toNumber()
  console.log(`Fast forward to the future by ${totalDuration} seconds`)
  await ethers.provider.send('evm_increaseTime', [totalDuration])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
