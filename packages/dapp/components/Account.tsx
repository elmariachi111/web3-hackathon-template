import { Button, Text } from "@chakra-ui/react";
import React from "react";
import { useWeb3 } from "./Web3Context";

const Account = () => {
  const { account, connect } = useWeb3();

  return account ? (
    <Text>{account}</Text>
  ) : (
    <Button onClick={() => connect()}>connect</Button>
  );
};

export { Account };
