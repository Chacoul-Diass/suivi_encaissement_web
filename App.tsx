"use client";
import { PropsWithChildren } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App({ children }: PropsWithChildren) {
  return (
    <div>
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
