import {
  Resolver,
  Query,
  Arg,
  Mutation,
  FieldResolver,
  Root,
  Authorized,
  Ctx,
  PubSub,
  PubSubEngine,
  ID,
  registerEnumType,
} from "type-graphql";
import { UserWhereInput } from "../inputs/UserWhere";
import { DiscordInformation, SubscriptionUser, User } from "../types/User";
import { getResolvers } from "../auth0/index";
import { formatName, sanitizeUser } from "../auth0/utils";
import config from "../config";
import { Role } from "../types/Role";
import phone from "phone";
import { UpdateUserInput } from "../inputs/UserUpdate";
import { BadgeInput, DisplayedBadgeInput } from "../inputs/Badge";
import LruCache from "lru-cache";
import fetch from "node-fetch";
import { AuthRole, Context } from "../context";
import { UserSubscriptionTopics } from "./UserSubscriptions";
import Uploader from "@codeday/uploader-node";
import { Badge, PizzaOrTurtle, SubscriptionBadge } from "../types/Badge";
import { GraphQLUpload, FileUpload } from "graphql-upload";
import { Inject } from "typedi";
import { UserSearch } from "../inputs/UserSearch";
import { UserPictureTransformInput } from "../inputs/Picture";

const {
  findUsers,
  findUsersUncached,
  getRolesForUser,
  getAllUsers,
  findUsersByRole,
  findRoles,
  updateUser,
  addRole,
} = getResolvers(config.auth0.domain, config.auth0.clientId, config.auth0.clientSecret);

const MAX_DISPLAYED_BADGES = 3;

const ROLE_CODES = config.roleCodes;

console.log(`Role codes:\n`, ROLE_CODES);

function getRoleByCode(code: string) {
  return ROLE_CODES[code.replace(/\W/g, "") as keyof typeof ROLE_CODES] || null;
}

const lru = new LruCache<String, DiscordInformation | null>({ ttl: 1000 * 60 * 5, max: 500 });

@Resolver(SubscriptionUser)
export class SubscriptionUserResolver {
  @FieldResolver({ name: "roles" })
  async roles(@Root() { id }: User) {
    return getRolesForUser(id);
}
  }

@Resolver(User)
export class UserResolver {
  @Inject(() => Uploader)
  private readonly uploader: Uploader;

  @Query(() => User, { nullable: true })
  async getUser(
    @Arg("where", () => UserWhereInput) where: UserWhereInput,
    @Arg("fresh", () => Boolean, { nullable: true }) fresh: boolean,
    @Ctx() { auth }: Context
  ): Promise<User | undefined> {
    if (auth.isUser && auth.user) {
      where = { id: auth.user };
    }
    try {
      const fn = fresh ? findUsersUncached : findUsers;
      // code to optimize and fix later
      // await updateUser(where, { scopes: ["write:users"] }, (prev: any) => {
      //   const user = sanitizeUser({ ...prev })
      //   return { ...user };
      // });
      // await getRolesForUser(id)
      return (await fn(where, {}))[0] || null;
    } catch (ex) {
      return;
    }
  }

  @Authorized(AuthRole.ADMIN, AuthRole.READ)
  @Query(() => [User], { nullable: "items" })
  async getDiscordUsers(): Promise<[User] | []> {
    try {
      return await getAllUsers({});
    } catch (ex) {
      return [];
    }
  }

  @Query(() => [User], { nullable: "items" })
  async searchUsers(@Arg("where", () => UserSearch) where: UserSearch): Promise<[User] | []> {
    return findUsers(where, {}) || [];
  }

  @Query(() => [Role], { nullable: "items" })
  async userRoles(@Arg("id", () => ID) id: string): Promise<[Role] | []> {
    return getRolesForUser(id) || [];
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async updateUser(
    @Arg("username") username: string,
    @Arg("updates") updates: UpdateUserInput,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    if (!ctx.auth.user && !username) {
      throw new Error("Please specify a user to update.");
    } else if (
      updates.username &&
      updates.username !== updates.username.replace(/[^a-zA-Z0-9\-_]/g, "")
    ) {
      throw new Error("Username can only consist of letters, numbers, and _ or -.");
    } else if (!updates.familyName && typeof updates.familyName !== "undefined") {
      throw new Error("Name is required.");
    } else if (!updates.givenName && typeof updates.givenName !== "undefined") {
      throw new Error("Name is required.");
    } else if (updates.acceptTos === false && !ctx.auth.read) {
      throw new Error("You cannot unaccept the TOS.");
    }
    if (updates.phoneNumber) {
      updates.phoneNumber = phone(updates.phoneNumber).phoneNumber || "";
    }

    await updateUser({ username }, ctx, async (prev: any) => {
      if (prev.username && updates.username) throw new Error("You cannot change your username!");
      const newUser = {
        ...prev,
        ...updates,
      };
      if (updates.displayNameFormat || updates.givenName || updates.familyName) {
        newUser.name = formatName(newUser.displayNameFormat, newUser.givenName, newUser.familyName);
      }
      if (
        Object.keys(prev).length === Object.keys(newUser).length &&
        Object.keys(prev).every((p) => prev[p] === newUser[p])
      ) {
        return true;
      }
      const user = sanitizeUser(newUser);
      const payload: SubscriptionUser = user;
      await pubSub.publish(UserSubscriptionTopics.update, payload);
      return user;
    });
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async grantBadge(
    @Arg("where") where: UserWhereInput,
    @Arg("badge") badge: BadgeInput,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    await updateUser(where, {}, (prev: any) => {
      const user = {
        ...prev,
        badges: [...(prev.badges || []).filter((b: any) => b.id !== badge.id), badge],
      };
      const payload: SubscriptionBadge = { type: "grant", user, badge };
      pubSub.publish(UserSubscriptionTopics.badgeUpdate, payload);
      return user;
    });
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async revokeBadge(
    @Arg("where") where: UserWhereInput,
    @Arg("badge") badge: BadgeInput,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    await updateUser(where, {}, (prev: any) => {
      const user = {
        ...prev,
        badges: [...(prev.badges || []).filter((b: { id: string }) => b.id !== badge.id)],
      };
      const payload: SubscriptionBadge = { type: "revoke", user, badge };
      pubSub.publish(UserSubscriptionTopics.badgeUpdate, payload);
      return user;
    });
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async setDisplayedBadges(
    @Arg("where") where: UserWhereInput,
    @Arg("badges", () => [DisplayedBadgeInput], { nullable: true })
    badges: DisplayedBadgeInput[],
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    if (!ctx.auth.user && !where) {
      throw new Error("Please specify a user to update.");
    } else if (badges.length > MAX_DISPLAYED_BADGES) {
      throw new Error("Displayed badges cannot be more than 3.");
    }

    await updateUser(where, ctx, (prev: User) => {
      const oldDisplayedBadges =
        prev.badges ||
        []
          .filter((b: { displayed: boolean }) => b.displayed === true)
          .slice(0, MAX_DISPLAYED_BADGES);
      const displayedBadges: Badge[] =
        prev.badges?.filter((badge: { id: string }) => badges.some((e) => e.id === badge.id)) || [];
      if (
        Object.keys(oldDisplayedBadges).length === Object.keys(displayedBadges).length &&
        Object.keys(oldDisplayedBadges).every(
          (p) =>
            oldDisplayedBadges[p as unknown as number] === displayedBadges[p as unknown as number]
        )
      ) {
        return true;
      }
      displayedBadges.map((badge: Badge) => {
        badge.order = badges.find((x) => x.id === badge.id)?.order || 0;
      });
      displayedBadges.sort((a: Badge, b: Badge) => (a.order || 0) - (b.order || 0));
      displayedBadges.map((badge: Badge, index: any) => {
        badge.displayed = true;
        badge.order = index;
      });

      const notDisplayedBadges =
        prev.badges?.filter((badge: { id: string }) => !badges.some((e) => e.id === badge.id)) ||
        [];
      notDisplayedBadges.map((badge: Badge) => {
        badge.displayed = false;
        badge.order = null;
      });
      const user: User = {
        ...prev,
        badges: [...displayedBadges, ...notDisplayedBadges] as Badge[],
      };
      const payload: SubscriptionUser = user;
      pubSub.publish(UserSubscriptionTopics.displayedBadgeUpdate, payload);
      return user;
    });

    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async addRole(
    @Arg("id", () => ID) id: string,
    @Arg("roleId", () => ID) roleId: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    const user = (await findUsersUncached({ id }, {}))[0];
    try {
      await addRole(id, roleId, {});
    } catch (error) {
      throw new Error(error as string);
    }
    const payload: SubscriptionUser = user;
    pubSub.publish(UserSubscriptionTopics.roleUpdate, payload);
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async addRoleByCode(
    @Arg("where") where: UserWhereInput,
    @Arg("code") code: string,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    where = ctx?.auth?.user ? { id: ctx?.auth?.user } : where;

    const users = await findUsersUncached(where, {});
    const roleId = getRoleByCode(code);

    if (!users || users.length === 0) return false;
    if (!roleId) throw new Error("Invalid role code");

    try {
      await addRole(users[0].id, roleId, {});
    } catch (error) {
      throw new Error(error as string);
    }
    const payload: SubscriptionUser = users[0];
    pubSub.publish(UserSubscriptionTopics.roleUpdate, payload);
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async linkDiscord(
    @Arg("userId", () => ID) userId: string,
    @Arg("discordId") discordId: string,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    await updateUser({ id: userId }, ctx, (prev: any) => {
      if (prev.discordId) {
        throw new Error("Discord already linked!");
      }
      const user = { discordId, ...prev };
      const payload: SubscriptionUser = user;
      pubSub.publish(UserSubscriptionTopics.update, payload);
      return user;
    });
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async unlinkDiscord(
    @Arg("userId", () => ID) userId: string,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    await updateUser({ id: userId }, ctx, (prev: User) => {
      if (!prev.discordId) {
        throw new Error("That user does not have a Discord account linked!");
      }
      const user = { ...prev, discordId: null };
      const payload = prev.discordId;
      pubSub.publish(UserSubscriptionTopics.unlinkDiscord, payload);
      return user;
    });
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => Boolean)
  async pizzaOrTurtleCult(
    @Arg("where") where: UserWhereInput,
    @Arg("pizzaOrTurtle", () => PizzaOrTurtle) pizzaOrTurtle: PizzaOrTurtle,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<boolean> {
    const badgeId = pizzaOrTurtle.toLowerCase();
    const otherBadgeId = badgeId == "turtle" ? "pizza" : "turtle";
    await updateUser(where, ctx, (prev: any) => {
      if ((prev.badges || []).filter((b: any) => b.id === otherBadgeId).length > 0) {
        throw new Error(`HEY YOU ARE ALREADY APART OF THE ${otherBadgeId.toUpperCase()} CULT`);
      } else if ((prev.badges || []).filter((b: any) => b.id === badgeId).length > 0) {
        throw new Error("You are already apart of that cult!");
      }
      const user = {
        ...prev,
        badges: [...(prev.badges || []).filter((b: any) => b.id !== badgeId), { id: badgeId }],
      };
      const cultPayload: SubscriptionUser = user;
      pubSub.publish(UserSubscriptionTopics.cultSelection, cultPayload);
      const badgePayload: SubscriptionBadge = {
        type: "grant",
        user,
        badge: { id: badgeId },
      };
      pubSub.publish(UserSubscriptionTopics.badgeUpdate, badgePayload);
      return user;
    });
    return true;
  }

  @Authorized(AuthRole.ADMIN, AuthRole.USER, AuthRole.WRITE)
  @Mutation(() => String)
  async uploadProfilePicture(
    @Arg("where") where: UserWhereInput,
    @Arg("upload", () => GraphQLUpload) upload: FileUpload,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine
  ): Promise<string> {
    const { createReadStream, filename } = await upload;
    const chunks = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of createReadStream()) {
      chunks.push(chunk);
    }
    const uploadBuffer = Buffer.concat(chunks);
    const result = await this.uploader.image(uploadBuffer, filename || "_.jpg");
    if (!result.url) {
      throw new Error(
        "An error occured while uploading your picture. Please refresh the page and try again."
      );
    }
    await updateUser(where, ctx, (prev: User) => {
      const user: User = {
        ...prev,
        picture: result.urlResize.replace(/{(width|height)}/g, 256 as unknown as string),
      };

      const payload: SubscriptionUser = user;
      pubSub.publish(UserSubscriptionTopics.profilePictureUpdate, payload);
      return user;
    });
    return result.url;
  }

  @FieldResolver({ name: "roles" })
  async roles(@Root() { id }: User) {
    return getRolesForUser(id);
  }

  @FieldResolver({ name: "discordInformation" })
  async discordInformation(@Root() { discordId }: User): Promise<DiscordInformation | null> {
    if (!discordId) return null;
    let result: DiscordInformation | null = lru.get(discordId) || null;

    if (!result) {
      const response = await fetch("https://discordapp.com/api/users/" + discordId, {
        method: "GET",
        headers: { Authorization: "Bot " + process.env.DISCORD_BOT_TOKEN },
      });
      const data = await response.json();
      result = data
        ? {
            username: data.username,
            discriminator: data.discriminator,
            handle: data.discriminator === "0" ? `@${data.username}` : `@${data.username}#${data.discriminator}`,
            tag: `<@${discordId}>`,
            avatar: "https://cdn.discordapp.com/avatars/" + discordId + "/" + data.avatar,
          }
        : null;
    }
    lru.set(discordId, result);
    return result;
  }

  @FieldResolver()
  badges(
    @Root() { badges }: User,
    @Arg("displayed", { nullable: true }) displayed: boolean
  ): Badge[] | undefined {
    return displayed
      ? badges?.filter((b: Badge) => b.displayed)
      : badges?.filter((b: Badge) => !b.displayed);
  }

  @FieldResolver()
  picture(
    @Root() { picture }: User,
    @Arg("transform", { nullable: true }) transform: UserPictureTransformInput
  ): string | undefined {
    if (!transform || Object.keys(transform).length === 0) return picture;

    if (picture?.match(/gravatar\.com/)) {
      const maxDimension = Math.max(transform.width || 0, transform.height || 0);
      const sizelessUrl = picture?.replace(/s=\d+/, "");
      return `${sizelessUrl}${sizelessUrl.match(/\?/) ? "&" : "?"}s=${maxDimension}`;
    }

    const imgArgs = Object.entries(transform)
      .map(
        ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value).toLowerCase()}`
      )
      .join(";");

    return picture?.replace(
      /https:\/\/img.codeday.org\/[a-zA-Z0-9]+\//,
      `https://img.codeday.org/${imgArgs}/`
    );
  }
}
