import { PubSub as LegacyPubSub } from "graphql-subscriptions";

class PubSubAdapter {
    private readonly pubSub = new LegacyPubSub();

    publish(routingKey: string, ...args: unknown[]): void {
        void this.pubSub.publish(routingKey, args[0]);
    }

    subscribe(routingKey: string): AsyncIterable<unknown> {
        return this.pubSub.asyncIterator(routingKey) as unknown as AsyncIterable<unknown>;
    }
}

export const pubSub = new PubSubAdapter();
