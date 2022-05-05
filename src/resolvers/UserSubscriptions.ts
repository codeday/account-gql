import {
  Resolver,
  Query,
  Arg,
  registerEnumType,
  ID,
  Mutation,
  FieldResolver,
  Root,
  Subscription,
} from "type-graphql";
import { UsersWhere } from "../inputs/UserWhere";
import { SubscriptionUser, User } from "../types/User";
import { getResolvers } from "../auth0/index";
import { sanitizeUser } from "../auth0/utils";
import config from "../config";
import { Role } from "../types/Role";
import { SubscriptionBadge } from "../types/Badge";

export enum UserSubscriptionTopics {
  update = "USER_UPDATE",
  badgeUpdate = "BADGE_UPDATE",
  displayedBadgeUpdate = "DISPLAYED_BADGES_UPDATE",
  roleUpdate = "ROLE_UPDATE",
  unlinkDiscord = "UNLINK_DISCORD",
  cultSelection = "CULT_SELECTION",
  profilePictureUpdate = "PROFILE_PICTURE_UPDATE",
}

@Resolver(User)
export class UserSubscriptionResolver {
  @Subscription({
    topics: UserSubscriptionTopics.update,
  })
  userUpdate(
    @Root() userUpdatePayload: SubscriptionUser
  ): SubscriptionUser {
    return userUpdatePayload;
  }

  @Subscription({
    topics: UserSubscriptionTopics.badgeUpdate,
  })
  userBadgeUpdate(
    @Root() userBadgeUpdatePayload: SubscriptionBadge
  ): SubscriptionBadge {
    return userBadgeUpdatePayload;
  }

  @Subscription({
    topics: UserSubscriptionTopics.displayedBadgeUpdate,
  })
  userDisplayedBadgesUpdate(
    @Root() userDisplayedBadgeUpdatePayload: SubscriptionUser
  ): SubscriptionUser {
    return userDisplayedBadgeUpdatePayload;
  }

  @Subscription({
    topics: UserSubscriptionTopics.roleUpdate,
  })
  userRoleUpdate(
    @Root() userRoleUpdatePayload: SubscriptionUser
  ): SubscriptionUser {
    return userRoleUpdatePayload;
  }

  @Subscription({
    topics: UserSubscriptionTopics.unlinkDiscord,
  })
  userUnlinkDiscord(
    @Root() userUnlinkDiscordPayload: string
  ): string {
    return userUnlinkDiscordPayload;
  }

  @Subscription({
    topics: UserSubscriptionTopics.cultSelection,
  })
  userCultSelection(
    @Root() userCultSelectionPayload: SubscriptionUser
  ): SubscriptionUser {
    return userCultSelectionPayload;
  }

  @Subscription({
    topics: UserSubscriptionTopics.profilePictureUpdate,
  })
  userProfilePictureUpdate(
    @Root() userCultSelectionPayload: SubscriptionUser
  ): SubscriptionUser {
    return userCultSelectionPayload;
  }
}
