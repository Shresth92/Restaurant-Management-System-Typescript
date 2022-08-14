import dotenv from "dotenv";
dotenv.config();

import firebase from "firebase-admin";

const { STORAGE_BUCKET } = process.env;

const serviceAccountkey = require("../rms-restaurant-image-upload-firebase-adminsdk-v7o2p-210c4c6032.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccountkey),
  storageBucket: STORAGE_BUCKET,
});

export default firebase;
