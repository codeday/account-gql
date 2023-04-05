import "reflect-metadata";
import server from "./server";
import Container from "typedi";
import Uploader from "@codeday/uploader-node";
import config from "./config";

Container.set(Uploader, new Uploader(config.uploader.base, config.uploader.secret));

server();
