import { useEffect, useState } from 'react';
import { readContract } from '@wagmi/core'
import { useAppKitAccount } from '@reown/appkit/react';


// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// // ABIs
import realEstateABI from './abis/RealEstate.json'
import escrowABI from './abis/Escrow.json'

// Config
import config from './config.json';
import { config2, publicClient } from './preload/config';
import { getChainId } from "viem/actions";


// Get the chain ID asynchronously

function App() {
  
  const { address, isConnected } = useAppKitAccount();
  
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)
  
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);
  
  const loadBlockchainData = async () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    // setProvider(provider)
    // const network = await provider.getNetwork()
    
    // const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    // Function to fetch token balances
    const chainId = await getChainId(publicClient); 
    
    // const totalSupply = await realEstate.totalSupply()
    const _addressRealEstateContract = config[chainId].realEstate.address;
    const totalSupply = await readContract(config2, {
      abi: realEstateABI,
      address: _addressRealEstateContract,
      functionName: 'totalSupply',
    })
    console.log(totalSupply,"Total Supply")
    const homes = []

    

    for (var i = 1; i <= 1; i++) {
      // const uri = await realEstate_Contract.tokenURI(i)
      const uri = await await readContract(config2, {
        abi: realEstateABI,
        address: _addressRealEstateContract,
        args: [i],
        functionName: 'tokenURI'
      })

      console.log(uri,"URI")
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }

    // setHomes(homes)

    // const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    // setEscrow(escrow)

    // window.ethereum.on('accountsChanged', async () => {
    //   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //   const account = ethers.utils.getAddress(accounts[0])
    //   setAccount(account);
    // })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className='cards__section'>

        <h3>Homes For You</h3>

        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
