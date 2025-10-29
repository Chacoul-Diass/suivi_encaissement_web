import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./auth/user.slice";
import UserReducer from "./user/get.user.slice";
import resetPasswordReducer from "./auth/send-email-reset.slice";
import resetPasswordOtpReducer from "./auth/reset-password-otp.slice";

//add user
import userAddReducer from "./user/create-user.slice";
import UserSUpdateReducer from "./user/update-user.slice";
import UserGetPatchReducer from "./user/get-patch-user.slice";
import UserDeleteReducer from "./user/delete-user.slice";

//select
import directionRegionalesReducer from "./select/dr.slice";
import ProfileReducer from "./select/profile.slice";
import SecteursReducer from "./select/secteur.slice";
import caissesReducer from "./select/caisse.slice";
import produitReducer from "./select/produit.slice";
import BanquesReducer from "./select/banque.slice";
import modeReglementReducer from "./select/modeReglement.slice";
import journeeCaisseReducer from "./select/journeeCaisse.slice";
import nombreAlertReducer from "./select/nombrealert.slice";
import BanquesMailReducer from "./select/banqueMail.slice";
//habilitation
import objetReducer from "./permission/objet-get-slice";
import permissionsReducer from "./permission/list-crud.slice";
import deleteProfileReducer from "./permission/delete-habilitation.slice";

//encaissement
import datareleveReducer from "./encaissements/releve.slice";
import encaissementValidationReducer from "./encaissements/soumission.slice";
import mailbanqReducer from "./mail/mail.slice";

//etat
import etatEncaissementReducer from "./etat/etat.slice";

//Rapprochement
import dataRapprochementReducer from "./rapprochement/rapprochement.slice";
import dataRapprochementJadeReducer from "./rapprochement/rapprochementJade.slice";
import dataRapprochementSmartReducer from "./rapprochement/rapprochementSmart";
//dashboard
import dashboardReducer from "./dashboard/dashbord.slice";

//parametre
import parametreReducer from "./parametres/parametre.slice";

import themeConfigSlice from "../themeConfigSlice";

const persistConfig = {
  key: "suivi-encaissement",
  storage,
  whitelist: ["auth", "mail", "sendmail"],
  blacklist: [],
};

// Combinaison des reducers
const topReducer = combineReducers({
  themeConfig: themeConfigSlice,
  auth: authReducer,
  mail: resetPasswordReducer,
  reset: resetPasswordOtpReducer,

  // user
  usersData: UserReducer,
  useradd: userAddReducer,
  userUpdate: UserSUpdateReducer,
  useGetPatch: UserGetPatchReducer,
  deleteUser: UserDeleteReducer,

  //select
  dr: directionRegionalesReducer,
  profile: ProfileReducer,
  secteur: SecteursReducer,
  caisses: caissesReducer,
  produit: produitReducer,
  Banques: BanquesReducer,
  modeReglement: modeReglementReducer,
  journeeCaisse: journeeCaisseReducer,
  BanquesMail: BanquesMailReducer,

  //habilitation
  ListHabilitation: objetReducer,
  permissionCrud: permissionsReducer,
  deleteProfile: deleteProfileReducer,

  //encaissement
  encaissementReleve: datareleveReducer,
  validationEncaissement: encaissementValidationReducer,
  sendmail: mailbanqReducer,

  //etat
  etatEncaissement: etatEncaissementReducer,

  //Rapprochement
  rapprochement: dataRapprochementReducer,
  rapprochementJade: dataRapprochementJadeReducer,
  rapprochementSmart: dataRapprochementSmartReducer,

  //dashboard
  dashboard: dashboardReducer,

  //parametre
  parametres: parametreReducer,

  //nombre alert
  nombreAlert: nombreAlertReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return topReducer(state, action);
};

export default persistReducer(persistConfig, rootReducer);
