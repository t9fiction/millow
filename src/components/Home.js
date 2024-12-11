import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { getChainId } from "viem/actions";
import { readContract, writeContract } from '@wagmi/core'
import { useAppKitAccount } from '@reown/appkit/react';

// // ABIs
import realEstateABI from '../abis/RealEstate.json'
import escrowABI from '../abis/Escrow.json'
import config from '../config.json';

import close from '../assets/close.svg';
import { config2, publicClient } from '../preload/config';
import { parseEther, parseUnits } from 'viem';


const Home = ({ home, togglePop }) => {
    const { address, isConnected } = useAppKitAccount();
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
        // -- Buyer

        const chainId = await getChainId(publicClient); 

        const _addressEscrowContract = await config[chainId].escrow.address;
        console.log(_addressEscrowContract)


        const buyer = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'buyer'
        })
        setBuyer(buyer)

        const hasBought = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id, buyer],
            functionName: 'approval'
        })
        setHasBought(hasBought)

        // -- Seller
        const seller = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'seller'
        })
        setSeller(seller)

        const hasSold = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id, seller],
            functionName: 'approval'
        })
        setHasSold(hasSold)

        // -- Lender

        const lender = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'lender'
        })
        setLender(lender)

        const hasLended = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id, lender],
            functionName: 'approval'
        })
        setHasLended(hasLended)

        // -- Inspector

        const inspector = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'inspector'
        })
        setInspector(inspector)

        const hasInspected = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'inspectionPassed'
        })
        setHasInspected(hasInspected)
    }

    const fetchOwner = async () => {
        const chainId = await getChainId(publicClient); 

        const _addressEscrowContract = await config[chainId].escrow.address;
        console.log(_addressEscrowContract)

        if (await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'isListed'
        })) return

        const owner = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'buyer'
        })

        setOwner(owner)
    }

    const buyHandler = async () => {
        const chainId = await getChainId(publicClient); 

        const _addressEscrowContract = await config[chainId].escrow.address;
        console.log(_addressEscrowContract)

        const escrowAmount = await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'escrowAmount'
        })


        let transaction = await writeContract({ 
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'depositEarnest',
            args: [home.id],
            value: escrowAmount
         })

        transaction = await writeContract({ 
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'approveSale',
            args: [home.id],
         })

        

        // // const escrowAmount = await escrow.escrowAmount(home.id)
        // const signer = await provider.getSigner()

        // Buyer deposit earnest
        // let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        // await transaction.wait()

        // Buyer approves...
        // transaction = await escrow.connect(signer).approveSale(home.id)
        // await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {
        const chainId = await getChainId(publicClient); 

        const _addressEscrowContract = await config[chainId].escrow.address;
        console.log(_addressEscrowContract)

        // Inspector updates status
        const transaction = await writeContract({ 
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'updateInspectionStatus',
            args: [home.id, true],
         })

        setHasInspected(true)
    }

    const lendHandler = async () => {
        const chainId = await getChainId(publicClient); 

        const _addressEscrowContract = await config[chainId].escrow.address;
        console.log(_addressEscrowContract)

        // Lender approves...
        const transaction = await writeContract({ 
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'approveSale',
            args: [home.id],
        })

        const lendAmount = (await readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'purchasePrice'
        })
        - await  readContract(config2, {
            abi: escrowABI,
            address: _addressEscrowContract,
            args: [home.id],
            functionName: 'escrowAmount'
        }))

        // Lender sends funds to contract...
        // const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        
        const sendTransaction = () => {
            try {
              writeContract({
                to: _addressEscrowContract,
                value: parseEther(lendAmount.toString()), // Convert to wei
                gasLimit: 60000n
              })
            } catch (err) {
              console.error('Transaction failed', err)
            }
          }
        //   await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)
    }

    const sellHandler = async () => {

        const chainId = await getChainId(publicClient); 

        const _addressEscrowContract = await config[chainId].escrow.address;
        console.log(_addressEscrowContract)

        // Seller approves...
        let transaction = await writeContract({ 
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'approveSale',
            args: [home.id],
        })

        // Seller finalize...
        transaction = await writeContract({ 
            abi: escrowABI,
            address: _addressEscrowContract,
            functionName: 'finalizeSale',
            args: [home.id],
        })

        setHasSold(true)
    }
    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])

    return (
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {(address === inspector) ? (
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (address === lender) ? (
                                <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                            ) : (address === seller) ? (
                                <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}

                            <button className='home__contact'>
                                Contact agent
                            </button>
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Home;