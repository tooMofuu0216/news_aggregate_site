'use client';
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ChakraProvider } from '@chakra-ui/react'
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default api.withTRPC(MyApp);
