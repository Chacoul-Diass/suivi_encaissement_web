"use client";

import React from "react";
import GlobalLoader from "../common/GlobalLoader";

const Loading: React.FC = () => {
  return <GlobalLoader type="default" message="Chargement de l'application..." />;
};

export default Loading;
