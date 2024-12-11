import { ethers } from 'ethers';
import logo from '../assets/logo.svg';
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';

const Navigation = () => {
    const { open } = useAppKit()
    const { address, isConnected } = useAppKitAccount();

    const connectHandler = async () => open()

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Millow</h1>
            </div>

            {isConnected ? (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    {address.slice(0, 6) + '...' + address.slice(38, 42)}
                </button>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;