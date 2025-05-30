import React from "react";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";

const { Header, Content, Footer } = Layout;

const MENU_ITEMS = [
  {
    key: "/",
    label: "Inicio",
  },
  {
    key: "/interview",
    label: "Entrevista",
  },
  {
    key: "/answers",
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
    <Menu 
      theme="dark" 
      mode="horizontal" 
      selectedKeys={[router.pathname]}
    >
      {MENU_ITEMS.map(({ key, label }) => (
      <Menu.Item 
        key={key}
        onClick={() => router.push(key)}
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
      Desenvolvido por <a href="https://www.linkedin.com/in/thiago-gouv%C3%AAa-aa3bb915a/" target="_blank" rel="noreferrer">Thiago Gouvêa</a>
    </Footer>
  </Layout>
  );
}
