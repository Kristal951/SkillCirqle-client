import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types/AuthStore";

export const mapFirebaseUserToAppUser = (user: FirebaseUser): Partial<User> => {
    console.log(user.displayName)
  return {
    uid: user.uid,
    email: user.email || "",
    name: user?.displayName || ""
  };
};