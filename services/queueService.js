const Token = require("../models/Token");

/**
 * Join queue
 */
async function joinQueue(name) {
  const lastToken = await Token.findOne().sort({ tokenNumber: -1 });
  const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

  const token = new Token({
    name,
    tokenNumber: nextTokenNumber,
    status: "waiting",
  });

  await token.save();
  return token;
}

/**
 * Get full queue
 */
async function getQueue() {
  return await Token.find().sort({ tokenNumber: 1 });
}

/**
 * Call next token
 * - complete current serving
 * - serve next waiting
 */
async function callNextToken() {
  const currentServing = await Token.findOne({ status: "serving" });

  if (currentServing) {
    currentServing.status = "completed";
    await currentServing.save();
  }

  const nextWaiting = await Token.findOne({ status: "waiting" }).sort({
    tokenNumber: 1,
  });

  if (!nextWaiting) return null;

  nextWaiting.status = "serving";
  await nextWaiting.save();

  return nextWaiting;
}

/**
 * Skip current serving token
 */
async function skipCurrentToken() {
  const currentServing = await Token.findOne({ status: "serving" });

  if (!currentServing) {
    throw new Error("No token is currently being served");
  }

  currentServing.status = "skipped";
  await currentServing.save();

  return currentServing;
}

/**
 * Clear entire queue
 */
async function clearQueue() {
  await Token.deleteMany({});
}

module.exports = {
  joinQueue,
  getQueue,
  callNextToken,
  skipCurrentToken,
  clearQueue,
};
