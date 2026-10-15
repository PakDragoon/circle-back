# Chrome Web Store listing

Everything to paste into the Chrome Web Store developer dashboard, tab by tab.

## Package

Upload `circle-back.zip`, built with `npm run zip`. The store takes the name, summary (132 characters max) and icon from `src/manifest.json`.

## Store listing tab

**Description**

```
Meeting bingo that marks itself.

Circle Back puts a bingo card on your Google Meet, Microsoft Teams or Zoom call. Turn on the meeting's captions and squares light up on their own when people say the buzzwords: "let's circle back", "you're on mute", "can you see my screen?", "low-hanging fruit". Five in a row and you've got bingo.

HOW IT WORKS
• Join a call in Chrome and turn on captions. Your card appears in the corner.
• Squares are marked automatically when their phrase shows up in the captions. "You're on mute", "you are muted" and "YOU'RE ON MUTE!" all count.
• You can tap squares yourself too, and tap again to undo.
• Drag the card anywhere, shrink it to a small pill, or hide it for the rest of the meeting.
• Bingo gets a little confetti and no sound. You're in a meeting.

PLAY WITH YOUR TEAM
Share a team code in the meeting chat. Everyone who enters it gets a card from the same phrase pack, but every card is different. First to bingo wins.

SHARE YOUR WIN
"Copy card" puts an image of your card on the clipboard, ready to paste into Slack, Teams or WhatsApp.

PHRASE PACKS
• Corporate classics: synergy, bandwidth, move the needle, take this offline
• Remote-work fails: you're on mute, you froze, sorry go ahead, next slide
• Engineering stand-up: blocked, works on my machine, quick fix, merge conflict
• Sales call: pain points, next steps, ROI, does that make sense?
• Your own: write your team's in-jokes in settings

DESKTOP APPS
In the Zoom or Teams desktop apps, open a card in its own small window from the toolbar button and tap squares as you hear them.

STATS
See your bingos, your fastest bingo and the phrases you hear most.

PRIVATE BY DESIGN
• Captions are read and matched on your computer only. Nothing is recorded, saved or sent anywhere.
• No microphone or camera access.
• Runs only on Google Meet, Microsoft Teams and Zoom's web client.
• No accounts, no servers, no tracking.

Open source: https://github.com/PakDragoon/circle-back
```

**Category:** Just for Fun (or Communication)
**Language:** English

**Graphic assets**

| Field | File |
| --- | --- |
| Store icon (128×128) | `src/icons/icon-128.png` |
| Screenshots (1280×800) | `store/screenshot-1-bingo.png` to `store/screenshot-5-packs.png`, in that order |
| Small promo tile (440×280) | `store/promo-small-440x280.png` |
| Marquee promo tile (1400×560) | `store/promo-marquee-1400x560.png` |

**Additional fields**

- Homepage URL: `https://github.com/PakDragoon/circle-back`
- Support URL: `https://github.com/PakDragoon/circle-back/issues`

## Privacy practices tab

**Single purpose**

```
Circle Back shows a meeting bingo card during Google Meet, Microsoft Teams and Zoom web calls and marks squares when their phrases appear in the meeting's live captions.
```

**Permission justifications**

| Permission | Justification |
| --- | --- |
| `storage` | Saves the user's settings, bingo stats, the card's position on screen and the pop-out card, on the device only. |
| Host permissions / content script on `meet.google.com`, `teams.microsoft.com`, `teams.live.com`, `teams.cloud.microsoft`, `*.zoom.us/wc/*` | Shows the bingo card during calls on these meeting sites and reads the live caption text the site displays, to mark squares. Caption text is matched locally and never stored or transmitted. |

**Remote code:** No, I am not using remote code. All JavaScript is included in the package.

**Data usage.** Tick:

- **Website content.** The extension reads live caption text on meeting pages. It is processed on the device only and is never stored or transmitted.

Leave every other category unticked.

Then tick all three certifications:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** `https://github.com/PakDragoon/circle-back/blob/main/PRIVACY.md`

## Distribution tab

- Visibility: Public (or Unlisted to share by link first)
- Regions: All regions
- Pricing: Free
