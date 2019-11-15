"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const versioning_1 = require("./structures/versioning");
const axios_1 = __importDefault(require("axios"));
const await_to_js_1 = __importDefault(require("await-to-js"));
function getVersions() {
    return __awaiter(this, void 0, void 0, function* () {
        let res, err;
        [err, res] = yield await_to_js_1.default(axios_1.default.get(constants_1.ENDPOINT));
        let versions = {};
        if (err) {
            return versions;
        }
        let match, promises = [];
        while ((match = constants_1.MM_REGEX.exec(res.data)) !== null) {
            match[1] = match[1].replace('/', '');
            if (match[1].length <= 0) {
                continue;
            }
            let split = match[1].split('.');
            promises.push(getBuilds(`${constants_1.ENDPOINT}/${match[1]}`, versions, split[0], split[1]));
        }
        yield Promise.all(promises);
        return versions;
    });
}
exports.getVersions = getVersions;
function getBuilds(endpoint, versions, major, minor) {
    return __awaiter(this, void 0, void 0, function* () {
        let err, res;
        [err, res] = yield await_to_js_1.default(axios_1.default.get(endpoint));
        if (err) {
            throw new Error(`Failed to pull builds from ${endpoint}`);
        }
        let match;
        while ((match = constants_1.BUILD_REGEX.exec(res.data)) !== null) {
            let platform = versioning_1.parsePlatform(match[2]);
            if (process.platform == 'win32' && platform != versioning_1.Platform.Windows) {
                continue;
            }
            if (process.platform == 'darwin' && platform != versioning_1.Platform.Mac) {
                continue;
            }
            if (process.platform == 'linux' && platform != versioning_1.Platform.Linux) {
                continue;
            }
            let v = new versioning_1.Version(major, minor, match[1], platform, match[3]);
            versions[v.toString()] = v;
        }
    });
}