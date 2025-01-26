import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WalletKitProvider } from '@mysten/wallet-kit'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletKitProvider features={['sui:signAndExecuteTransactionBlock']}>
      <App />
    </WalletKitProvider>
  </React.StrictMode>,
)