import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Web3Provider } from "../components/Web3Context";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    // heading: "Space Mono",
    // body: "Space Mono",
    // textTransform: "uppercase",
  },
  styles: {},
  colors: {},
  components: {},
});


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </ChakraProvider>
  );
}

export default MyApp;
