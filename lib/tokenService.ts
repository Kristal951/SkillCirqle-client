import { TokenTransaction } from "@/types/AuthStore";
import { adminDB, FieldValue } from "./firebaseAdmin";

export async function awardTokens({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: string;
}) {
  const userRef = adminDB.collection("users").doc(userId);
  const txRef = userRef.collection("transactions");

  if (reason === "onboarding_reward") {
    const existing = await txRef.where("reason", "==", reason).limit(1).get();

    if (!existing.empty) {
      throw new Error("ALREADY_REWARDED");
    }
  }

  let updatedTokens = 0;
  let updatedTotalEarned = 0;

  await adminDB.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new Error("USER_NOT_FOUND");
    }

    const data = userDoc.data();

    const wallet = data?.wallet || {
      skillTokens: 0,
      totalEarned: 0,
    };

    const currentTokens = wallet.skillTokens || 0;
    const totalEarned = wallet.totalEarned || 0;

    updatedTokens = currentTokens + amount;
    updatedTotalEarned = totalEarned + amount;

    transaction.update(userRef, {
      "wallet.skillTokens": updatedTokens,
      "wallet.totalEarned": updatedTotalEarned,
    });

    const newTxRef = txRef.doc();

    const txData: TokenTransaction = {
      userId,
      amount,
      type: "earn",
      reason,
      createdAt: new Date(),
    };

    transaction.set(newTxRef, txData);
  });

  return {
    tokens: updatedTokens,
    totalEarned: updatedTotalEarned,
  };
}

export const spendTokens = async ({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: string;
}) => {
  const userRef = adminDB.collection("users").doc(userId);

  await adminDB.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) throw new Error("User not found");

    const wallet = userDoc.data()?.wallet;

    if (wallet.skillTokens < amount) {
      throw new Error("Insufficient tokens");
    }

    transaction.update(userRef, {
      "wallet.skillTokens": wallet.skillTokens - amount,
    });

    const txRef = adminDB.collection("tokenTransactions").doc();

    transaction.set(txRef, {
      userId,
      amount: -amount,
      type: "spend",
      reason,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
};
