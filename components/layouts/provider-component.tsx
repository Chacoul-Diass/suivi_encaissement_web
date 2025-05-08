"use client";
import App from "@/App";
import store from "@/store";
import { ReactNode, Suspense } from "react";
import { Provider } from "react-redux";
import Loading from "./loading";
import { AlertModalProvider } from "../contexts/AlertModalContext";

interface IProps {
  children?: ReactNode;
}

const ProviderComponent = ({ children }: IProps) => {
  return (
    <Provider store={store}>
      <Suspense fallback={<Loading />}>
        <AlertModalProvider>
          <App>{children}</App>
        </AlertModalProvider>
      </Suspense>
    </Provider>
  );
};

export default ProviderComponent;
// todo
// export default appWithI18Next(ProviderComponent, ni18nConfig);
