import { Button, Container, Flex, Heading, Image, SimpleGrid, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Account } from "../components/Account";
import { useWeb3 } from "../components/Web3Context";
import { Token as TokenContract, Token__factory as TokenFactory}  from '@token/contracts';
import {BigNumberish} from 'ethers'
import { TransferEvent } from "@token/contracts/typechain/ERC721";

interface TokenMetadataResponse {
  id: BigNumberish,
  metadata: {
    name: string;
    description: string;
    image: string;
  }
}

const Home: NextPage = () => {
  const [nextTokenId, setNextTokenId] = useState<string>();
  const [contract, setContract] = useState<TokenContract>();
  const [tokens, setTokens] = useState<TokenMetadataResponse[]>([]);
  const { provider, signer, account } = useWeb3();

  useEffect(() => {
    if (!signer) return;
    (async () => {
      const tokenFactory = TokenFactory.connect(process.env.NEXT_PUBLIC_TOKEN_CONTRACT as string, signer);
      const contract = tokenFactory.attach(process.env.NEXT_PUBLIC_TOKEN_CONTRACT as string);
      setContract(contract);
    })();
  }, [signer]);
  
  useEffect(() => {
    if (!contract) return;
    (async () => {
      const nti = await contract.nextTokenId();
      setNextTokenId(nti.toString())
    })();
  },[contract])

  const fetchToken = async (contract: TokenContract, tokenId: string): Promise<TokenMetadataResponse> => {
    const tokenUri = await contract.tokenURI(tokenId);
    const metadata = await fetch(tokenUri, {
      method: "GET",
      headers: {
        "Content-type": "application/json"
      }
    });
    
    return {
      id: tokenId,
      metadata: await metadata.json() 
    };
  }

  const fetchTokens = useCallback(async (address: string): Promise<TokenMetadataResponse[]> => {
    if (!contract) return [];
      const _balance = await contract.balanceOf(address);
      if (_balance.isZero()) return [];
      const filter = contract.filters.Transfer(null, address);
      const transfers = await contract.queryFilter(filter);
      const promises = transfers.map((e) => {
        return fetchToken(contract, e.args.tokenId.toString());
      });
      return Promise.all(promises);
      
  },[contract]) 

  useEffect(() => {
    if (!contract || !account) return;
    (async () => {
      setTokens(await fetchTokens(account));
    })(); 
  },[contract, account, fetchTokens]);

  const mint = useCallback(async () => {
    if (!contract || !account) return;
    
    const tx = await contract.safeMint(account);
    const receipt = await tx.wait();
    const transferEvent: TransferEvent = receipt.events?.find((evt) => evt.event === "Transfer") as TransferEvent;
    const tokenId = transferEvent.args.tokenId;
    const newToken = await fetchToken(contract, tokenId.toString());
    setTokens([...tokens, newToken]);

    const nti = await contract.nextTokenId();
    setNextTokenId(nti.toString())
  },[contract, tokens, setTokens, account])

  return (
    <Container maxW="container.xl" p="2" h="100vh" as={Flex} direction="column">
      <Head>
        <title>tokens</title>
      </Head>
      <Flex justify="space-between" align="center" my={12}>
        <Heading>tokens</Heading>
        <Account />
      </Flex>
      <SimpleGrid columns={[1, 2, 3, 4]} spacing={10}>
        {tokens.map((t) => (
          <Flex key={t.id.toString()} direction="column" align="center" p={3}>
            <Image src={t.metadata.image} alt={t.metadata.description}/>
            <Text fontSize="xl">{t.metadata.name}</Text>
          </Flex>
        ))}
      </SimpleGrid>
      <Button onClick={mint} disabled={!nextTokenId}>mint {nextTokenId}</Button>
    </Container>
  );
};

export default Home;
