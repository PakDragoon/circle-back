/* Phrase packs. Each phrase has a short label for the card and the ways
 * people actually say it, which is what the caption matcher looks for. */

export interface Phrase {
  label: string;
  says: string[];
}

export interface Pack {
  id: string;
  name: string;
  blurb: string;
  phrases: Phrase[];
}

const p = (label: string, ...says: string[]): Phrase => ({ label, says: says.length ? says : [label] });

export const PACKS: Pack[] = [
  {
    id: "corporate",
    name: "Corporate classics",
    blurb: "Synergy, bandwidth and everything we'll circle back on.",
    phrases: [
      p("Circle back", "circle back", "circling back", "circled back"),
      p("Synergy", "synergy", "synergies", "synergize"),
      p("Low-hanging fruit", "low hanging fruit"),
      p("Move the needle", "move the needle", "moves the needle", "moving the needle"),
      p("Take this offline", "take this offline", "take it offline", "taking this offline"),
      p("Touch base", "touch base", "touching base"),
      p("Bandwidth", "bandwidth"),
      p("Deep dive", "deep dive", "deep diving"),
      p("Let's align", "align on", "get aligned", "alignment", "let's align"),
      p("Action items", "action item", "action items"),
      p("At the end of the day", "at the end of the day"),
      p("Game changer", "game changer", "game changing"),
      p("Leverage", "leverage", "leveraging"),
      p("Same page", "on the same page", "same page"),
      p("Quick win", "quick win", "quick wins"),
      p("Going forward", "going forward", "moving forward"),
      p("Parking lot", "parking lot", "park that", "park this"),
      p("Double-click", "double click on", "double click into"),
      p("Boil the ocean", "boil the ocean", "boiling the ocean"),
      p("Win-win", "win win"),
      p("Ballpark", "ballpark"),
      p("Loop in", "loop in", "looped in", "loop you in", "loop them in", "keep me in the loop", "in the loop"),
      p("Hard stop", "hard stop"),
      p("Per my last email", "per my last email", "as per my email", "as i mentioned in my email"),
      p("Stakeholders", "stakeholder", "stakeholders"),
      p("North star", "north star"),
      p("Paradigm shift", "paradigm shift"),
      p("Value add", "value add", "value added"),
      p("Pivot", "pivot", "pivoting"),
      p("Learnings", "learnings"),
    ],
  },
  {
    id: "remote",
    name: "Remote-work fails",
    blurb: "You're on mute. Can you see my screen?",
    phrases: [
      p("You're on mute", "you're on mute", "you are on mute", "you're muted", "you are muted"),
      p("Can you see my screen?", "see my screen", "seeing my screen", "see the screen"),
      p("Can you hear me?", "can you hear me", "can everyone hear me", "can you guys hear me", "can you all hear me"),
      p("You froze", "you froze", "you're frozen", "you are frozen", "it froze"),
      p("Sorry, go ahead", "sorry go ahead", "no go ahead", "you go ahead", "you go first"),
      p("We lost them", "we lost him", "we lost her", "we lost them", "dropped off"),
      p("Give it a minute", "give it a minute", "give people a minute", "give people a couple of minutes", "wait a minute for", "few more people to join"),
      p("I was on mute", "i was on mute", "i was muted"),
      p("Bad connection", "bad connection", "my internet", "unstable connection", "wifi"),
      p("Sorry I'm late", "sorry i'm late", "sorry for being late", "sorry i'm a bit late"),
      p("Is it just me?", "is it just me"),
      p("You're breaking up", "breaking up", "you cut out", "cutting out", "you're cutting out"),
      p("Next slide", "next slide"),
      p("Let me share my screen", "share my screen", "sharing my screen", "screen share"),
      p("Can you repeat that?", "repeat that", "say that again", "come again"),
      p("I had to step away", "step away", "stepped away", "be right back"),
      p("There's an echo", "an echo", "hear an echo", "getting echo"),
      p("I'll send the recording", "send the recording", "share the recording", "watch the recording"),
      p("Who just joined?", "who just joined", "just joined"),
      p("Wrong window", "wrong window", "wrong tab", "wrong screen"),
      p("Can you make it bigger?", "make it bigger", "zoom in", "can't read"),
      p("Camera off", "camera off", "turn on your camera", "camera on", "my camera"),
      p("Let me drop off", "drop off", "have to drop", "need to jump", "jump off"),
      p("Is this recording?", "is this being recorded", "are we recording", "is it recording"),
      p("Dog barking", "my dog", "the dog", "dog is barking"),
      p("Thanks everyone", "thanks everyone", "thank you everyone", "thanks all"),
      p("Hello? Hello?", "hello hello"),
      p("Over time", "over time", "running over", "a few minutes over"),
    ],
  },
  {
    id: "engineering",
    name: "Engineering stand-up",
    blurb: "Blocked, in review, works on my machine.",
    phrases: [
      p("Blocked", "blocked", "blocker", "blockers", "blocking"),
      p("Works on my machine", "works on my machine", "works locally", "worked locally"),
      p("Quick fix", "quick fix", "small fix", "one line fix", "one liner"),
      p("Edge case", "edge case", "edge cases", "corner case"),
      p("Tech debt", "tech debt", "technical debt"),
      p("Refactor", "refactor", "refactoring", "refactored"),
      p("Flaky test", "flaky", "flakey"),
      p("In review", "in review", "under review", "code review", "needs review"),
      p("Merge conflict", "merge conflict", "merge conflicts"),
      p("Hotfix", "hotfix", "hot fix"),
      p("Roll back", "roll back", "rollback", "rolled back", "revert"),
      p("Prod is down", "prod is down", "production is down", "outage", "incident"),
      p("ETA", "eta", "how long will"),
      p("Scope creep", "scope creep", "out of scope", "in scope"),
      p("It depends", "it depends"),
      p("Legacy code", "legacy", "old code"),
      p("Spike", "spike", "dig into", "look into it"),
      p("Story points", "story points", "story point", "estimate", "estimation"),
      p("End of day", "end of day", "eod", "by tonight"),
      p("Ship it", "ship it", "shipped", "ship this"),
      p("Looks good to me", "looks good to me", "lgtm"),
      p("Pair on it", "pair on", "pairing", "pair programming", "jump on a call"),
      p("CI is red", "pipeline", "ci is", "build is failing", "build failed", "the build"),
      p("Pushed a fix", "pushed a fix", "pushed the fix", "pushed it"),
      p("Staging", "staging"),
      p("Ticket", "ticket", "jira"),
      p("No updates", "no updates", "same as yesterday", "nothing new"),
      p("Carry over", "carry over", "carried over", "next sprint"),
    ],
  },
  {
    id: "sales",
    name: "Sales call",
    blurb: "Pain points, next steps and does that make sense?",
    phrases: [
      p("ROI", "roi", "return on investment"),
      p("Pain point", "pain point", "pain points"),
      p("Decision maker", "decision maker", "decision makers"),
      p("Budget", "budget", "budgeted"),
      p("Next steps", "next steps", "next step"),
      p("Follow up", "follow up", "following up", "followup"),
      p("Pricing", "pricing", "price point"),
      p("Quick demo", "demo"),
      p("Use case", "use case", "use cases"),
      p("Pilot", "pilot", "trial", "proof of concept", "poc"),
      p("Contract", "contract", "agreement", "msa"),
      p("Onboarding", "onboarding", "onboard"),
      p("Renewal", "renewal", "renew"),
      p("Competitor", "competitor", "competitors", "alternative"),
      p("Integration", "integration", "integrate", "integrates"),
      p("Discount", "discount", "special pricing"),
      p("Does that make sense?", "does that make sense", "make sense"),
      p("Champion", "champion"),
      p("Procurement", "procurement", "legal team", "security review"),
      p("End of quarter", "end of quarter", "this quarter", "q4", "q1"),
      p("Pipeline", "pipeline"),
      p("Value proposition", "value proposition", "value prop"),
      p("Out of the box", "out of the box"),
      p("Seamless", "seamless", "seamlessly"),
      p("Scalable", "scalable", "at scale"),
      p("Best in class", "best in class", "industry leading", "world class"),
      p("Partnership", "partnership", "partner with"),
      p("Send over a deck", "the deck", "send over", "one pager"),
    ],
  },
];

export const packById = (id: string): Pack => PACKS.find((x) => x.id === id) ?? PACKS[0];

/** "Custom" pack built from settings. One phrase per line; "|" separates ways of saying it. */
export function customPack(lines: string): Pack {
  const phrases = lines
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()).filter(Boolean))
    .filter((parts) => parts.length)
    .map(([label, ...rest]) => p(label, label, ...rest));
  return { id: "custom", name: "Your phrases", blurb: "Your own in-jokes.", phrases };
}
