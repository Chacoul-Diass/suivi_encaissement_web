import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { persistStore } from "redux-persist";
import rootReducer from "./reducers/rootReducer";
import { isDev } from "@/utils/isDev";
import { useDispatch } from "react-redux";

// Configuration du middleware logger, seulement en développement
const loggerMiddleware = createLogger({
  predicate: () => isDev(),
  collapsed: true,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }) // Désactive la vérification de sérialisation pour redux-persist
      .concat(loggerMiddleware),
});

export const persistor = persistStore(store);

// Types TypeScript pour le store et le dispatch
export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<TAppDispatch>();

export default store;
