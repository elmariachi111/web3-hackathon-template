import { providers } from "ethers";
import React, { useCallback, useContext, useEffect, useState } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

interface IWeb3Context {
  provider?: providers.Web3Provider;
  signer?: ethers.Signer;
  account?: string;
  connect: () => Promise<unknown>;
}

const Web3Context = React.createContext<IWeb3Context>({
  connect: () => Promise.resolve({}),
});

const useWeb3 = () => useContext(Web3Context);

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [web3Resources, setWeb3Resources] = useState<{
    provider: providers.Web3Provider;
    signer: ethers.Signer;
    account: string;
  }>();

  useEffect(() => {
    const w3m = new Web3Modal({
      cacheProvider: true,
      network: "31337",
      providerOptions: {
        walletconnect: {
          display: {
            name: "Wallet Connect",
          },
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.NEXT_PUBLIC_INFURA_KEY, // required
          },
        },
      },
    });
    setWeb3Modal(w3m);
  }, []);

  const connect = useCallback(async (provider?: string) => {
    if (!web3Modal) return;
    const instance =  provider ? web3Modal.connectTo(provider) : web3Modal.connect();
    const _provider = new providers.Web3Provider(await instance);
    const signer = await _provider.getSigner();
    const account = await signer.getAddress();
    setWeb3Resources({
      provider: _provider,
      signer,
      account,
    });
  },[web3Modal]);

  useEffect(() => {
    if (web3Modal) {
      const p = web3Modal.cachedProvider;
      if (p) {
        connect(p);
      }
    }
  },[web3Modal, connect])


  return (
    <Web3Context.Provider value={{ ...web3Resources, connect }}>
      {children}
    </Web3Context.Provider>
  );
};

export { Web3Provider, useWeb3 };