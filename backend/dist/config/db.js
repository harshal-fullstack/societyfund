"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dataStore_1 = require("../services/dataStore");
const seed_1 = require("../scripts/seed");
const connectDB = async () => {
    // Ensure seed data is present in dataStore first
    if (!dataStore_1.dataStore.hasData()) {
        await (0, seed_1.seedDatabase)();
    }
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/societyfund';
    try {
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 1500,
        });
        console.log('📦 Connected to MongoDB successfully.');
        dataStore_1.dataStore.setMongoConnected(true);
    }
    catch (error) {
        console.log('🔄 Running in persistent JSON/Memory Store mode.');
        dataStore_1.dataStore.setMongoConnected(false);
    }
};
exports.connectDB = connectDB;
