import { providers } from "ethers";
import React, { useCallback, useContext, useEffect, useState } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

interface IWeb3Resources {
  provider?: providers.Web3Provider;
  signer?: ethers.Signer;
  account?: string;
  chainId?: number;
}

interface IWeb3Context extends IWeb3Resources {
  connect: () => Promise<void>;
}

const Web3Context = React.createContext<IWeb3Context>({
  connect: () => Promise.resolve(),
  //disconnect: () => Promise.resolve({}),
});

const useWeb3 = () => useContext(Web3Context);

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [web3Resources, setWeb3Resources] = useState<IWeb3Resources>();

  useEffect(() => {
    const w3m = new Web3Modal({
      cacheProvider: true,
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

  const disconnect = async () => {
    if (!web3Modal) return;

    //TODO remove/reset context
    await web3Modal.clearCachedProvider();
  };

  const connect = useCallback(async (provider?: string) => {
    if (!web3Modal) return;
    const instance =  provider ? web3Modal.connectTo(provider) : web3Modal.connect();
    const _instance = await instance;
    const _provider = new providers.Web3Provider(_instance);
    const signer = await _provider.getSigner();
    const account = await signer.getAddress();

    setWeb3Resources({
      provider: _provider,
      signer,
      account,
      chainId: Number(_instance.chainId),
    });
    _instance.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
      setWeb3Resources((old) => ({
        ...old,
        account: accounts[0],
      }));
    });

    _instance.on("chainChanged", (chainId: number) => {
      setWeb3Resources((old) => ({
        ...old,
        chainId,
      }));
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