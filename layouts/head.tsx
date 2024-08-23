import React from "react";
import NextHead from "next/head";

import { siteConfig } from "@/config/site";
import {wallet_connect,wallet_list_generate,wallet_init_data_set , wallet_mpc_set_kp} from "../core/wallet/index";

import { useState, useEffect } from 'react'

/**
 * MPC web3auth
 */
import { Web3Auth, decodeToken } from "@web3auth/single-factor-auth";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

export const Head = () => {
    //init
    try{
      wallet_init_data_set()
    }catch(e){
      console.log("🚧 init error",e)
    }

    //Web3auth MPC
    const verifier = "tonspack-mpc";

    const clientId = "BGhzy_MwnoMn2fP12APsIm0RCv9cove_zNeZp5PIaoIPCZGPYrnlkO2o9Pf8XPhaxQVQOKK7QQCQVf974LZxfEs"; // get from https://dashboard.web3auth.io
    
    
    const chainConfig = {
      chainId: "0x1",
      displayName: "Ethereum Mainnet",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Ethereum",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth",
      blockExplorerUrl: "https://etherscan.io",
    };
    
    const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig },
    });
    const web3authSfa = new Web3Auth({
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
      usePnPKey: false,
      privateKeyProvider: ethereumPrivateKeyProvider,
    });
    
    const [kp, setKp] = useState("");
    
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const jwtToken = params.get("token");
      console.log("🔥 Head compment auth :: ",jwtToken)
      if (jwtToken) {
        loginWithWeb3Auth(jwtToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }, []);
    

    const loginWithWeb3Auth = async (idToken: string) => {
      console.log("🔥 loginWithWeb3Auth",idToken)
      try {
        await web3authSfa.init();
        console.log("🔥web3authSfa init")
        const { payload } = decodeToken(idToken);
        console.log(payload)
    
        console.log("🔥web3authSfa.status",web3authSfa.status,web3authSfa.status == "connected")
    
        if(web3authSfa.status == "connected")
        {
    
        }else{
          const cnn = await web3authSfa.connect({
            verifier,
            verifierId: (payload as any).sub,
            idToken: idToken!,
          });
          console.log("🔥 web3authSfa Connect success : ",cnn)
        }
        if (!web3authSfa.provider) {
          console.log("🐞 Web3auth not init")
          return;
        }
        const privateKey = await web3authSfa.provider.request({
          method: "eth_private_key"
        });
        console.log("🐞 Web3auth privateKey : ",privateKey)
        setKp(privateKey as string)
        wallet_mpc_set_kp(privateKey as string)
      } catch (err) {
        console.error(err);
      }
    };
    
  return (
    <NextHead>
      <title>{siteConfig.name}</title>
      <meta key="title" content={siteConfig.name} property="og:title" />
      <meta content={siteConfig.description} property="og:description" />
      <meta content={siteConfig.description} name="description" />
      <meta
        key="viewport"
        content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        name="viewport"
      />
      <link href="/favicon.ico" rel="icon" />
    </NextHead>
  );
};
