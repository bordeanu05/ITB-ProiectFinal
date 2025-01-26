import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectButton, useWalletKit } from '@mysten/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import './App.css';

const IBT_ETH_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const IBT_ETH_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function mint(address to, uint256 amount) public",
  "function burn(address from, uint256 amount) public"
];

const suiClient = new SuiClient({ url: 'http://127.0.0.1:9000' });

// Sui constants -> not working :(
const SUI_PACKAGE_ID = "0xd56e2a166b64e6d8dd4af205347e6ff399287e8a36a725beaac5425301170abe";
const SUI_TREASURY_CAP = "0xda62068eee228840bec7fd4148dbcf6b8de26d0bba5f5d6a9988d71dc0288ded";
const SUI_MODULE_NAME = "ibt";
const SUI_COIN_TYPE = `${SUI_PACKAGE_ID}::${SUI_MODULE_NAME}::IBT`;

function App() {
  const [activeTab, setActiveTab] = useState<'eth' | 'sui'>('eth');
  const [ethAccount, setEthAccount] = useState<string>('');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Sui wallet integration
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  const connected = !!currentAccount;

  // Sui mint function 
  const handleSuiMint = async () => {
    if (!amount || Number(amount) <= 0 || !currentAccount) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const tx = new TransactionBlock();
      const amountInDecimals = Math.floor(Number(amount) * 10**9); // 9 decimals as defined in contract
      
      tx.moveCall({
        target: `${SUI_PACKAGE_ID}::ibt::mint`,
        arguments: [
          tx.object(SUI_TREASURY_CAP),
          tx.pure(amountInDecimals.toString()), // u64 expects string representation
          tx.pure(currentAccount.address)
        ],
      });

      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      console.log('Mint transaction completed:', result);
      setAmount('');
      alert('Tokens minted successfully!');
    } catch (error) {
      console.error('Sui mint error:', error);
      alert('Failed to mint tokens: ' + error.message);
    }
    setLoading(false);
  };

  // Sui burn function (with coin handling)
  const handleSuiBurn = async () => {
    if (!amount || Number(amount) <= 0 || !currentAccount) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const amountInDecimals = Math.floor(Number(amount) * 10**9);
      
      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: SUI_COIN_TYPE,
      });

      if (coins.data.length === 0) {
        throw new Error('No IBT coins found in wallet');
      }

      const tx = new TransactionBlock();
      
      const primaryCoin = coins.data[0];
      const coinToBurn = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [
        tx.pure(amountInDecimals.toString())
      ]);

      tx.moveCall({
        target: `${SUI_PACKAGE_ID}::ibt::burn`,
        arguments: [
          tx.object(SUI_TREASURY_CAP),
          coinToBurn
        ],
      });

      // 5. Execute transaction
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      console.log('Burn transaction completed:', result);
      setAmount('');
      alert('Tokens burned successfully!');
    } catch (error) {
      console.error('Sui burn error:', error);
      alert('Failed to burn tokens: ' + error.message);
    }
    setLoading(false);
  };

  // Connect to MetaMask and switch to local network
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });

        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69',
              chainName: 'Anvil Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://localhost:8545']
            }]
          });
        } catch (error) {
          console.log("Network might already exist");
        }

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }],
        });

        const account = accounts[0];
        setEthAccount(account);
        await updateBalance(account);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Update balance
  const updateBalance = async (account: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const ibtContract = new ethers.Contract(
      IBT_ETH_ADDRESS,
      IBT_ETH_ABI,
      signer
    );

    const balance = await ibtContract.balanceOf(account);
    setEthBalance(ethers.formatUnits(balance, 18));
  };

  // Handle ETH Mint
  const handleMint = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const ibtContract = new ethers.Contract(
        IBT_ETH_ADDRESS,
        IBT_ETH_ABI,
        signer
      );

      const amountInWei = ethers.parseUnits(amount, 18);
      const tx = await ibtContract.mint(ethAccount, amountInWei);
      await tx.wait();
      
      await updateBalance(ethAccount);
      setAmount('');
      alert('Tokens minted successfully!');
    } catch (error) {
      console.error('Mint error:', error);
      alert('Failed to mint tokens. Make sure you are the contract owner.');
    }
    setLoading(false);
  };

  // Handle ETH Burn
  const handleBurn = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const ibtContract = new ethers.Contract(
        IBT_ETH_ADDRESS,
        IBT_ETH_ABI,
        signer
      );

      const amountInWei = ethers.parseUnits(amount, 18);
      const tx = await ibtContract.burn(ethAccount, amountInWei);
      await tx.wait();
      
      await updateBalance(ethAccount);
      setAmount('');
      alert('Tokens burned successfully!');
    } catch (error) {
      console.error('Burn error:', error);
      alert('Failed to burn tokens. Make sure you are the contract owner and have sufficient balance.');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>IBT Token Manager</h2>
      
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'eth' ? 'active' : 'inactive'} 
          onClick={() => setActiveTab('eth')}
        >
          Ethereum
        </button>
        <button 
          className={activeTab === 'sui' ? 'active' : 'inactive'} 
          onClick={() => setActiveTab('sui')}
        >
          Sui
        </button>
      </div>

      {/* Ethereum Tab Content */}
      {activeTab === 'eth' && (
        <div className="tab-content">
          <div className="wallet-connection">
            <button onClick={connectMetaMask} disabled={!!ethAccount}>
              {ethAccount ? 'MetaMask Connected' : 'Connect MetaMask'}
            </button>
            {ethAccount && (
              <div>
                <p>Address: {ethAccount}</p>
                <p>Balance: {ethBalance} IBT</p>
              </div>
            )}
          </div>

          {ethAccount && (
            <div className="token-actions">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                min="0"
              />
              <div className="button-group">
                <button 
                  onClick={handleMint}
                  disabled={loading || !amount}
                >
                  {loading ? 'Processing...' : 'Mint'}
                </button>
                <button 
                  onClick={handleBurn}
                  disabled={loading || !amount}
                >
                  {loading ? 'Processing...' : 'Burn'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sui Tab Content */}
      {activeTab === 'sui' && (
        <div className="tab-content">
          <div className="wallet-connection">
            <ConnectButton />
            <p>Connection status: {connected ? 'Connected' : 'Not Connected'}</p>
            <p>Current Account: {currentAccount ? currentAccount.address : 'No account'}</p>
          </div>

          <div className="token-actions">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              min="0"
            />
            <div className="button-group">
              <button 
                onClick={handleSuiMint}
                disabled={!connected || loading || !amount}
              >
                {loading ? 'Processing...' : 'Mint'}
              </button>
              <button 
                onClick={handleSuiBurn}
                disabled={!connected || loading || !amount}
              >
                {loading ? 'Processing...' : 'Burn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;