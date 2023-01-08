import { Flex, Text } from "@chakra-ui/react"
import { useAccount } from "wagmi"

export default function Home() {
  const { address } = useAccount()

  return (
    <Flex>
      <Text>{address}</Text>
    </Flex>
  )
}
