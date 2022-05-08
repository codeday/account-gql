import { registerEnumType } from "type-graphql";

export enum UserPictureFit {
    CLAMP = "CLAMP",
    CLIP = "CLIP",
    CROP = "CROP",
    FACEAREA = "FACEAREA",
    FILL = "FILL",
    FILLMAX = "FILLMAX",
    MAX = "MAX",
    MIN = "MIN",
    SCALE = "SCALE",
}
registerEnumType(UserPictureFit, {
    name: "UserPictureFit",
});