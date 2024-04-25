import "reflect-metadata";
import server from "./server";
import Container from "typedi";
import Uploader from "@codeday/uploader-node";
import config from "./config";
import Stripe from "stripe";

Container.set(Uploader, new Uploader(config.uploader.base, config.uploader.secret));
Container.set(Stripe, new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-04-10'
}));

server();
