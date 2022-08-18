import dotenv from "dotenv";
dotenv.config();

import firebase, { ServiceAccount } from "firebase-admin";

const { STORAGE_BUCKET } = process.env;

import account from "./serviceAccountKey.json";
const serviceAccountkey = account as ServiceAccount;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountkey),
  storageBucket: STORAGE_BUCKET,
});

export default firebase;
