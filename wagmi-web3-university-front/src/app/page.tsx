'use client'

import { ConnectKitButton } from 'connectkit'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import TokenSwapForm from '../../components/TokenSwapForm'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <>
     <div>

       <TokenSwapForm />
     </div>
    </>
  )
}

export default App
