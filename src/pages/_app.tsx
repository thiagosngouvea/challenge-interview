import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import theme from "@/utils/themeConfig";
import Layout from "@/layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={theme}>
      <Layout>{<Component {...pageProps} />}</Layout>
    </ConfigProvider>
  );
}
