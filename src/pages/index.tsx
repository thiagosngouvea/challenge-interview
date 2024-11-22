import React, { useState } from "react";
import { Modal } from "antd";
import { useRouter } from "next/router";

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-4 shadow-md rounded-xl">
        <p className="text-2xl font-bold text-center">Bem vindo ao simulador de entrevistas</p>
        <p className="text-center mt-4">
          Aqui você pode simular uma entrevista de emprego e receber feedbacks sobre sua performance
        </p>
        <div className="mt-8 flex justify-center">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={()=> setIsVisible(true)}>
            Começar a simulação
          </button>
        </div>
      </div>
      <Modal
        title={<p className="text-center">Instruções para a simulação de entrevista</p>}
        visible={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={[
          <button
            key="submit"
            className="bg-red-500 text-white px-4 py-2 rounded mr-4"
            onClick={() => setIsVisible(false)}
          >
            Não estou pronto
          </button>,
          <button
            key="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              setIsVisible(false)
              router.push("/interview")
            }}
          >
            Entendi
          </button>,
        ]}
      >
        <p className="my-8">
          Você terá 2 minutos para responder cada pergunta, após esse tempo o áudio será cortado e a próxima pergunta será feita
        </p>
      </Modal>
    </div>
  );
};

export default Home;
