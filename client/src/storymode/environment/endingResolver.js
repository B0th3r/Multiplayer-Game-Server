
function hasFlag(flags, name) {
  return flags instanceof Set ? flags.has(name) : false;
}

function pickAccused(flags) {
  const order = [
    ["accused_john", "john"],
    ["accused_sam", "sam"],
    ["accused_tim", "tim"],
    ["accused_donna", "donna"],
    ["accused_jane", "jane"],
    ["accused_florist", "florist"],
    ["accused_jim", "jim"],
  ];

  for (const [flag, suspectId] of order) {
    if (hasFlag(flags, flag)) return suspectId;
  }
  return "unknown";
}

export function resolveEnding(flags) {
  const accused = pickAccused(flags);

  const bobbyDirty = hasFlag(flags, "BobbyDirty");
  const bobbyGood = hasFlag(flags, "BobbyGood");
  const gainedMarcusTrust = hasFlag(flags, "GainedMarcusTrust");
  const marcusSentAway = hasFlag(flags, "marcus_sent_away");

  const youScrewedLucas = hasFlag(flags, "you_screwed_lucas");
  const hayesScrewedLucas = hasFlag(flags, "hayes_screwed_lucas");
  const interrogationFailed = hasFlag(flags, "interrogation_failed");

  let bobbyOutcome = "none";
  if (bobbyGood) bobbyOutcome = "good";
  else if (bobbyDirty && !gainedMarcusTrust) bobbyOutcome = "caught";
  else if (bobbyDirty && gainedMarcusTrust) bobbyOutcome = marcusSentAway ? "evil_get_away" : "evil";

  let endingId = "ending_mixed";
  if (interrogationFailed) endingId = "ending_failed";
  else if (bobbyOutcome === "caught") endingId = "ending_arrested";
  else if (bobbyOutcome === "evil_get_away") endingId = "ending_evil_clean";
  else if (bobbyOutcome === "good") endingId = "ending_good";
  else if (bobbyOutcome === "evil") endingId = "ending_evil";

  const addendum = [];

  if (youScrewedLucas) addendum.push("Lucas did not get credit for the flowers.");
  if (hayesScrewedLucas) addendum.push("Hayes received credit for the flowers.");

  if (bobbyOutcome === "good") addendum.push("Gambling den shut down.");
  if (bobbyOutcome === "caught") addendum.push("You and Bobby were arrested.");
  if (bobbyOutcome === "evil_get_away") addendum.push("Bobby took the fall.");
  if (bobbyOutcome === "evil") addendum.push("Evidence was redirected.");

  return { endingId, bobbyOutcome, accused, addendum };
}
