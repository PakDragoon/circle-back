# Circle Back privacy policy

_Last updated: 15 October 2026_

Circle Back is a browser extension that shows a bingo card during Google Meet, Microsoft Teams and Zoom calls in Chrome, and marks squares when their phrases appear in the meeting's live captions. This policy explains what data it handles.

## The short version

- Circle Back has no servers. Its developer does not receive, collect or store any of your data.
- Caption text is read and matched on your computer only. It is never saved and never sent anywhere.
- The extension does not use your microphone or camera, and does not record anything.
- There is no analytics, tracking, advertising or sale of data.

## What it reads

While you're in a call on Google Meet, Microsoft Teams or Zoom (in the browser), Circle Back reads the text of the live captions that the meeting app shows on the page, about once a second. It compares that text with the phrases on your bingo card, in memory, and then discards it. Captions are only read if you have turned them on in the meeting app.

Circle Back runs only on `meet.google.com`, `teams.microsoft.com`, `teams.live.com`, `teams.cloud.microsoft` and Zoom's web client (`*.zoom.us/wc/`). It cannot see any other website.

## What is stored on your device

Stored in your browser with `chrome.storage.local`, which never leaves your device:

- **Settings:** your chosen phrase pack, your custom phrases, an optional name, and which meeting apps to show the card in.
- **Stats:** how many bingos you've had, your fastest bingo, how many cards you've played, and how many times each bingo phrase has been heard. No caption text, meeting names or participant names are stored.
- **Card position:** where you last dragged the card on screen.
- **Your pop-out card**, if you use the card window for desktop meeting apps.
- **A random ID**, used only so teammates using the same team code get different cards.

Stored in the meeting page's session storage, which is cleared when you close the tab: your bingo card for the current meeting, so a page reload doesn't lose it.

You can reset your stats in the extension's settings, and remove everything by uninstalling the extension.

## What is sent, and to whom

Nothing. Circle Back makes no network requests.

Team codes work without a server: a code only decides which phrase pack is used and how cards are shuffled, so nobody's card or progress is shared.

## Use of data

Data is used only to provide Circle Back's single purpose: a meeting bingo card that marks itself from live captions. It is not sold, transferred to third parties, or used to determine creditworthiness or for lending.

## Changes

Changes to this policy will be published in this file in the project's GitHub repository, with a new "Last updated" date.

## Contact

Open an issue at https://github.com/PakDragoon/circle-back/issues.
