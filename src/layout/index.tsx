import React from "react";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";

const { Header, Content, Footer } = Layout;

const MENU_ITEMS = [
    {
        key: "1",
        label: "Entrevista",
    },
    {
        key: "2",
        label: "Respostas",
    },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function LayoutSidebar({ children }: LayoutProps) {
  const router = useRouter();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          {MENU_ITEMS.map(({ key, label }) => (
            <Menu.Item 
              key={key}
              onClick={() => router.push(key === "1" ? "/interview" : "/answers")}
            >
              {label}
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">{children}</div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©2018 Created by Ant UED
      </Footer>
    </Layout>
  );
}
