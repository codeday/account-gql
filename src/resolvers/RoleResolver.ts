import {
  Resolver,
  Query,
  Arg,
} from "type-graphql";
import { User } from "../types/User";
import { getResolvers } from "../auth0/index";
import config from "../config";
import { Role } from "../types/Role";
const {
  findUsers,
  findUsersUncached,
  getRolesForUser,
  getAllUsers,
  findUsersByRole,
  findRoles,
  updateUser,
  addRole,
} = getResolvers(
  config.auth0.domain,
  config.auth0.clientId,
  config.auth0.clientSecret
);

@Resolver(Role)
export class RoleResolver {
  @Query(() => [User], { nullable: "items" })
  async roleUsers(
    @Arg("roleId", () => String) roleId: String
  ): Promise<[User] | undefined> {
    return findUsersByRole(roleId, {});
  }

  @Query(() => [Role], { nullable: "items" })
  async roles(): Promise<[Role] | undefined> {
    return findRoles({}, {});
  }
}
