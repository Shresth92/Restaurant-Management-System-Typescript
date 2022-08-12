"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_1 = __importDefault(require("./config"));
const serviceAccountkey = require("../rms-restaurant-image-upload-firebase-adminsdk-v7o2p-210c4c6032.json");
console.log(config_1.default.firebaseConfig);
firebase_admin_1.default.initializeApp({
  credential: firebase_admin_1.default.credential.cert(serviceAccountkey),
  storageBucket: config_1.default.firebaseConfig.storageBucket,
});
exports.default = firebase_admin_1.default;
