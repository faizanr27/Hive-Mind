"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const db_1 = __importDefault(require("./db/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const content_routes_1 = __importDefault(require("./routes/content.routes"));
const share_routes_1 = __importDefault(require("./routes/share.routes"));
const cors = require('cors');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use(express_1.default.json());
const corsOptions = {
    origin: 'https://hivee-mind.vercel.app',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};
app.use(cors('*', corsOptions));
(0, db_1.default)();
app.use('/', auth_routes_1.default);
app.use('/', content_routes_1.default);
app.use('/', share_routes_1.default);
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
