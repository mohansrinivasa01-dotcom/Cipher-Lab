# Caesar --- Crypto Quest

A Flask-based educational web application for learning the **Caesar
Cipher** through interactive tools and a timed, story-driven game.

The project combines a clean browser interface with a small Python
backend. Users can encrypt messages, decrypt ciphertext when the key is
known, brute-force all 26 Caesar shifts, and play **Crypto Quest**,
where they solve randomized cipher challenges while earning XP and
building streaks.



------------------------------------------------------------------------

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Learning Objectives](#learning-objectives)
3.  [Features](#features)
4.  [How the Caesar Cipher Works](#how-the-caesar-cipher-works)
5.  [Application Flow](#application-flow)
6.  [Game Mechanics](#game-mechanics)
7.  [Project Structure](#project-structure)
8.  [Technology Stack](#technology-stack)
9.  [Requirements](#requirements)
10. [Installation](#installation)
11. [Running the Application](#running-the-application)
12. [Application Routes](#application-routes)
13. [API Reference](#api-reference)
14. [Example API Requests](#example-api-requests)
15. [Frontend Architecture](#frontend-architecture)
16. [Backend Architecture](#backend-architecture)
17. [Scoring and Progression](#scoring-and-progression)
18. [Brute-Force Analysis](#brute-force-analysis)
19. [Random Challenge Generation](#random-challenge-generation)
20. [User Interface](#user-interface)
21. [Responsive Navigation](#responsive-navigation)
22. [Security and Validation Notes](#security-and-validation-notes)
23. [Troubleshooting](#troubleshooting)
24. [Known Limitations](#known-limitations)
25. [Suggested Improvements](#suggested-improvements)
26. [Educational Use](#educational-use)
27. [License](#license)

------------------------------------------------------------------------

## Project Overview

**Caesar --- Crypto Quest** is designed as a beginner-friendly
introduction to classical cryptography.

The application teaches the Caesar Cipher using three complementary
learning modes:

-   **Encryption:** move letters forward by a selected key.
-   **Decryption:** move letters backward by a selected key.
-   **Brute force:** test every possible key from 0 through 25.
-   **Game:** practice the concepts through timed challenges involving
    decoding, key identification, and encryption.

The project intentionally keeps the cryptographic algorithm simple
enough to inspect and understand.

### Core concept

For an English alphabet of 26 letters, a Caesar shift replaces each
letter with another letter a fixed distance away.

For example, with key `3`:

``` text
Plain:   A B C D E F G H ...
Cipher:  D E F G H I J K ...
```

Therefore:

``` text
HELLO
```

becomes:

``` text
KHOOR
```

Decryption reverses the same shift:

``` text
KHOOR
```

with key `3` becomes:

``` text
HELLO
```

------------------------------------------------------------------------

## Learning Objectives

After using the application, a learner should be able to:

1.  Explain what a Caesar Cipher is.
2.  Encrypt a message with a known shift.
3.  Decrypt ciphertext with a known shift.
4.  Identify a Caesar key by comparing plaintext and ciphertext.
5.  Understand why there are only 26 possible shifts.
6.  Explain the difference between encryption and decryption.
7.  Understand why brute force is practical against a Caesar Cipher.
8.  Recognize that spaces, punctuation, and numbers are preserved.
9.  Practice solving cipher problems under time pressure.
10. Inspect a simple Flask application and understand how frontend and
    backend components communicate.

------------------------------------------------------------------------

# Features

## 1. Encryption Workspace

The `/encryption` page allows a user to:

-   Enter plaintext.
-   Select a key from `0` to `25`.
-   Encrypt the message.
-   Copy the result to the clipboard.

The frontend sends the plaintext and key to:

``` text
POST /api/encrypt
```

The backend performs the transformation and returns JSON.

------------------------------------------------------------------------

## 2. Decryption Workspace

The `/decryption` page allows a user to:

-   Paste ciphertext.
-   Select the known Caesar key.
-   Decrypt the message.
-   Copy the recovered plaintext.

The frontend sends the data to:

``` text
POST /api/decrypt
```

------------------------------------------------------------------------

## 3. Brute-Force Analyzer

The `/bruteforce` page is useful when the key is unknown.

It tests all 26 possible Caesar keys and displays every resulting
decryption.

The frontend calls:

``` text
POST /api/bruteforce
```

For a ciphertext such as:

``` text
KHOOR
```

the analyzer produces 26 candidates. One of those candidates will be:

``` text
HELLO
```

when the correct shift is identified.

------------------------------------------------------------------------

## 4. Crypto Quest Game

The `/` and `/game` pages open the interactive learning game.

The game includes:

-   Randomly generated challenges.
-   Decode challenges.
-   Key-identification challenges.
-   Encryption challenges.
-   A countdown timer.
-   Three lives.
-   XP.
-   Streaks.
-   Best-streak tracking.
-   Hints.
-   Time boosts.
-   Accuracy calculation.
-   A mission map.
-   End-of-run statistics.

------------------------------------------------------------------------

# How the Caesar Cipher Works

The implementation works independently for uppercase and lowercase
letters.

For uppercase characters:

``` python
chr((ord(char) - ord("A") + key) % 26 + ord("A"))
```

For lowercase characters:

``` python
chr((ord(char) - ord("a") + key) % 26 + ord("a"))
```

The modulo operation is what makes the alphabet wrap around.

For example, with key `3`:

``` text
X → A
Y → B
Z → C
```

Without modulo arithmetic, the program would run past `Z`.

## Characters that are not letters

Spaces and other non-alphabetic characters are returned unchanged.

For example:

``` text
Meet at 9!
```

with key `3` becomes:

``` text
Phhw dw 9!
```

The following are preserved:

-   Spaces
-   Digits
-   Punctuation
-   Symbols

------------------------------------------------------------------------

# Application Flow

A typical user journey is:

``` text
Open application
      |
      v
Crypto Quest briefing
      |
      v
Start mission
      |
      +------------------+
      |                  |
      v                  v
  Decode             Find Key
      |                  |
      +--------+---------+
               |
               v
           Encrypt
               |
               v
        Earn XP / streak
               |
               v
         Level progression
               |
               v
          Mission result
               |
               v
   Practice with dedicated tools
```

The dedicated practice pages can also be used independently of the game.

------------------------------------------------------------------------

# Game Mechanics

## Game state

The browser maintains the active game state in the `gameState`
JavaScript object.

Important fields include:

  Field          Purpose
  -------------- -------------------------------------------------
  `level`        Current game level
  `xp`           Current experience points
  `streak`       Current consecutive correct-answer streak
  `bestStreak`   Highest streak achieved during the run
  `lives`        Remaining attempts
  `round`        Current round number
  `correct`      Number of correct answers
  `total`        Number of answered challenges
  `time`         Remaining seconds
  `challenge`    Current challenge data
  `hinted`       Whether a hint has been used
  `boosted`      Whether the current round received a time boost
  `locked`       Prevents multiple submissions

------------------------------------------------------------------------

## Lives

The game starts with:

``` text
♥ ♥ ♥
```

A wrong answer removes one life.

When all lives are lost, the mission ends.

------------------------------------------------------------------------

## Timer

The current timer is calculated by:

``` javascript
18 + (level * 5)
```

Therefore:

    Level   Starting Time
  ------- ---------------
        1      23 seconds
        2      28 seconds
        3      33 seconds
        4      38 seconds
        5      43 seconds

The frontend currently limits the playable game to level 3, so the
active game normally uses 23, 28, and 33 seconds.

------------------------------------------------------------------------

## XP

Correct answers award:

``` text
20 XP
+ speed bonus
+ streak bonus
```

The speed bonus is:

``` text
floor(remaining_time / 5)
```

The streak bonus is:

``` text
current_streak × 3
```

The streak is increased after the reward is calculated.

Example:

``` text
Base XP       = 20
Time remaining = 20 seconds
Speed bonus    = 4
Current streak = 2
Streak bonus   = 6

Total          = 30 XP
```

------------------------------------------------------------------------

## Hints

A hint costs:

``` text
10 XP
```

The hint reveals the current shift.

For key-finding challenges, the hint specifically tells the player to
compare the first letters and provides the shift.

A hint can only be used once per challenge.

------------------------------------------------------------------------

## Time Boost

The time boost costs:

``` text
15 XP
```

The current implementation adds:

``` text
+10 seconds
```

to the round timer.

A boost can only be used once per challenge.

------------------------------------------------------------------------

## Challenge Types

### Decode

The player receives ciphertext and chooses the correct plaintext.

Example:

``` text
Ciphertext: KHOOR
Key: 3

Answer:
HELLO
```

The game generates multiple candidate plaintexts.

------------------------------------------------------------------------

### Find the Key

The player receives both plaintext and ciphertext.

Example:

``` text
HELLO → KHOOR
```

The player must identify:

``` text
KEY 03
```

------------------------------------------------------------------------

### Encrypt

The player receives plaintext and a key and must type the ciphertext.

Example:

``` text
Message: HELLO
Key: 3

Answer:
KHOOR
```

Unlike the other two modes, this challenge uses a text input rather than
multiple-choice buttons.

------------------------------------------------------------------------

# Project Structure

``` text
caesar_cipher_neumorphic/
│
├── app.py
├── README.md
├── requirements.txt
│
├── templates/
│   ├── base.html
│   ├── game.html
│   ├── encryption.html
│   ├── decryption.html
│   └── bruteforce.html
│
└── static/
    ├── script.js
    └── style.css
```

## `app.py`

Contains:

-   Flask application setup.
-   Caesar encryption function.
-   Caesar decryption function.
-   Random challenge generation.
-   Page routes.
-   JSON API endpoints.
-   Answer validation.

------------------------------------------------------------------------

## `templates/base.html`

Defines the shared page shell:

-   HTML document structure.
-   Header.
-   Navigation.
-   Mobile navigation.
-   Main content block.
-   Footer.
-   Global JavaScript include.

Other templates extend this file using Jinja inheritance.

------------------------------------------------------------------------

## `templates/game.html`

Contains the Crypto Quest interface:

-   Mission briefing.
-   Game statistics.
-   Mission map.
-   Challenge area.
-   Choice buttons.
-   Text answer field.
-   Hint controls.
-   Time boost.
-   Feedback.
-   Final results.

------------------------------------------------------------------------

## `templates/encryption.html`

Contains the standalone encryption workspace.

------------------------------------------------------------------------

## `templates/decryption.html`

Contains the standalone decryption workspace.

------------------------------------------------------------------------

## `templates/bruteforce.html`

Contains the 26-key brute-force analysis interface.

------------------------------------------------------------------------

## `static/script.js`

Contains the browser-side application logic.

Responsibilities include:

-   Form interaction.
-   API requests.
-   Key normalization.
-   Loading encryption/decryption results.
-   Brute-force result rendering.
-   Clipboard copying.
-   Mobile menu behavior.
-   Game state.
-   Game timer.
-   Challenge rendering.
-   Answer submission.
-   XP calculation.
-   Lives.
-   Hints.
-   Time boosts.
-   End-of-game statistics.

------------------------------------------------------------------------

## `static/style.css`

Contains the visual styling for:

-   Layout.
-   Typography.
-   Navigation.
-   Cards.
-   Buttons.
-   Inputs.
-   Game interface.
-   Mission map.
-   Responsive layouts.
-   Feedback states.

------------------------------------------------------------------------

# Technology Stack

## Backend

-   Python
-   Flask

## Frontend

-   HTML5
-   CSS3
-   Vanilla JavaScript
-   Jinja templates

## Fonts

The interface imports:

-   Manrope
-   DM Mono

from Google Fonts.

## Dependency

The project currently requires only Flask:

``` text
Flask>=3.0,<4.0
```

------------------------------------------------------------------------

# Requirements

Recommended environment:

-   Python 3.10+
-   `pip`
-   A modern web browser

The project has no database dependency and does not require Node.js.

------------------------------------------------------------------------

# Installation

## 1. Extract the project

Extract the project directory so that the structure resembles:

``` text
caesar_cipher_neumorphic/
├── app.py
├── requirements.txt
├── templates/
└── static/
```

## 2. Open a terminal

Change into the project directory:

``` bash
cd caesar_cipher_neumorphic
```

## 3. Create a virtual environment

### Windows

``` bash
python -m venv .venv
.venv\Scripts\activate
```

### macOS / Linux

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

## 4. Install dependencies

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

# Running the Application

Start Flask with:

``` bash
python app.py
```

The application will normally be available at:

``` text
http://127.0.0.1:5000
```

Open that address in a browser.

------------------------------------------------------------------------

# Application Routes

  Route           Purpose
  --------------- ------------------------
  `/`             Main Crypto Quest page
  `/game`         Crypto Quest page
  `/encryption`   Encryption workspace
  `/decryption`   Decryption workspace
  `/bruteforce`   Brute-force analyzer

------------------------------------------------------------------------

# API Reference

The application exposes several JSON endpoints.

## `POST /api/encrypt`

Encrypts text using a Caesar key.

### Request

``` json
{
  "text": "HELLO",
  "key": 3
}
```

### Response

``` json
{
  "result": "KHOOR"
}
```

------------------------------------------------------------------------

## `POST /api/decrypt`

Decrypts text using a Caesar key.

### Request

``` json
{
  "text": "KHOOR",
  "key": 3
}
```

### Response

``` json
{
  "result": "HELLO"
}
```

------------------------------------------------------------------------

## `POST /api/bruteforce`

Runs every possible Caesar decryption.

### Request

``` json
{
  "text": "KHOOR"
}
```

### Response shape

``` json
{
  "results": [
    {
      "key": 0,
      "text": "KHOOR"
    },
    {
      "key": 1,
      "text": "JGNNQ"
    }
  ]
}
```

The actual response contains all keys from `0` through `25`.

------------------------------------------------------------------------

## `POST /api/game/challenge`

Generates a randomized game challenge.

### Request

``` json
{
  "level": 1
}
```

The backend clamps the requested level to the range:

``` text
1–5
```

A challenge can be one of:

``` text
decode
key
encrypt
```

------------------------------------------------------------------------

## `POST /api/game/check`

Checks whether the submitted answer matches the expected answer.

### Request

``` json
{
  "answer": "HELLO",
  "submitted": "hello"
}
```

### Response

``` json
{
  "correct": true
}
```

Comparison is case-insensitive because both values are stripped and
converted to uppercase before comparison.

------------------------------------------------------------------------

# Example API Requests

## Using `curl`

### Encrypt

``` bash
curl -X POST http://127.0.0.1:5000/api/encrypt \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"HELLO\",\"key\":3}"
```

Expected result:

``` json
{"result":"KHOOR"}
```

### Decrypt

``` bash
curl -X POST http://127.0.0.1:5000/api/decrypt \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"KHOOR\",\"key\":3}"
```

Expected result:

``` json
{"result":"HELLO"}
```

### Brute force

``` bash
curl -X POST http://127.0.0.1:5000/api/bruteforce \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"KHOOR\"}"
```

------------------------------------------------------------------------

# Frontend Architecture

The frontend is intentionally framework-free.

Instead of React, Vue, or another frontend framework, the application
uses:

``` text
HTML + Jinja + CSS + Vanilla JavaScript
```

This keeps the project approachable for students learning web
development.

## API helper

The JavaScript application uses a shared `postJSON()` function to send
requests:

``` javascript
fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
});
```

This provides a simple interface between the browser and Flask.

------------------------------------------------------------------------

# Backend Architecture

The backend is deliberately small.

The central cipher function is:

``` python
def encrypt(text, key):
    result = ""
    for char in text:
        if char.isupper():
            result += chr((ord(char) - ord("A") + key) % 26 + ord("A"))
        elif char.islower():
            result += chr((ord(char) - ord("a") + key) % 26 + ord("a"))
        else:
            result += char
    return result
```

Decryption reuses the same function:

``` python
def decrypt(text, key):
    return encrypt(text, -key)
```

This is a useful programming pattern: rather than implementing two
separate character-shifting algorithms, decryption is expressed as
encryption with the opposite shift.

------------------------------------------------------------------------

# Scoring and Progression

The game uses a combination of:

``` text
Correctness
+
Speed
+
Streak
```

to determine XP.

This encourages players to learn the transformation rather than simply
waiting for unlimited attempts.

## Level advancement

A level increases after every three correct answers while the current
level is below the configured maximum.

In the current JavaScript:

``` javascript
if (gameState.correct % 3 === 0 && gameState.level < gameState.maxLevel) {
    gameState.level += 1;
}
```

The current maximum is:

``` javascript
maxLevel: 3
```

------------------------------------------------------------------------

# Brute-Force Analysis

A Caesar Cipher has only 26 possible shifts.

That means an attacker can simply calculate:

``` text
Key 00
Key 01
Key 02
...
Key 25
```

and inspect the outputs.

This is the fundamental educational reason the brute-force page exists.

The endpoint uses:

``` python
[
    {"key": key, "text": decrypt(text, key)}
    for key in range(26)
]
```

The complexity is effectively:

``` text
O(26 × message_length)
```

Since `26` is constant, this is extremely small for normal text.

------------------------------------------------------------------------

# Random Challenge Generation

The game uses:

``` python
random.SystemRandom()
```

to select challenges and keys.

The backend has a collection of:

### Words

``` text
SECRET
CIPHER
ORBIT
PLANET
PUZZLE
SPARK
LEARN
CODE
GALAXY
ROCKET
HIDDEN
MISSION
BRIDGE
VECTOR
ALPHA
BRAIN
QUEST
SIGNAL
MATRIX
SHIELD
```

### Phrases

``` text
MEET AT NOON
OPEN THE DOOR
LEARN BY DOING
CODE IS POWER
THE KEY IS FIVE
WELCOME AGENT
FIND THE SIGNAL
KEEP GOING
CRACK THE CODE
KNOWLEDGE WINS
```

Lower levels primarily use single words.

Higher challenge levels can use phrases.

------------------------------------------------------------------------

# User Interface

The visual design is based around a minimalist cryptography-studio
aesthetic.

The application includes:

-   Large editorial headings.
-   Monospace technical labels.
-   Rounded cards.
-   Soft visual depth.
-   Status indicators.
-   Mission-style game panels.
-   Responsive navigation.

The interface also includes small explanatory elements such as:

``` text
A → D means key 3
```

and:

``` text
Forward shift = encryption.
Backward shift = decryption.
```

These reinforce the core concept while the user interacts with the
application.

------------------------------------------------------------------------

# Responsive Navigation

The main navigation contains:

``` text
Encryption
Decryption
Brute force
Play
```

On smaller screens, the navigation collapses into a mobile menu.

The menu is controlled with JavaScript and updates:

``` text
aria-expanded
aria-hidden
```

to improve accessibility semantics.

------------------------------------------------------------------------

# Security and Validation Notes

This project is an educational application, not a production
cryptography service.

## Caesar Cipher security

The Caesar Cipher is **not secure modern encryption**.

Because there are only 26 possible shifts, it is trivial to brute-force.

Do not use this implementation to protect:

-   Passwords
-   API keys
-   Personal information
-   Financial data
-   Authentication tokens
-   Confidential business information

For real security applications, use established modern cryptographic
libraries and protocols.

------------------------------------------------------------------------

## Flask debug mode

The application currently starts with:

``` python
app.run(debug=True)
```

This is appropriate for local development but should not be used as-is
for a production deployment.

For production, use a proper WSGI server and disable Flask debug mode.

------------------------------------------------------------------------

## Input handling

The Caesar algorithm preserves arbitrary non-letter characters, but the
API does not implement extensive request validation.

For example, malformed values supplied to:

``` text
/api/encrypt
/api/decrypt
```

may result in a server-side error because the key is converted with
`int()`.

A production implementation should validate:

-   JSON structure.
-   Text type.
-   Key type.
-   Key range.
-   Request size.
-   Rate limits.

------------------------------------------------------------------------

## Game answer validation

The current game answer endpoint receives the expected answer from the
browser and compares it with the submitted answer.

That is acceptable for a simple local educational game, but it is not a
secure server-authoritative scoring architecture.

A determined user could modify browser state or request data.

For a competitive or authenticated game, the server should generate and
retain challenge state and validate the answer against server-side data.

------------------------------------------------------------------------

# Troubleshooting

## `ModuleNotFoundError: No module named 'flask'`

Install dependencies:

``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

## Port already in use

If port `5000` is occupied, either stop the other process or run Flask
on another port.

For example, the application can be adapted to:

``` python
app.run(debug=True, port=5001)
```

Then open:

``` text
http://127.0.0.1:5001
```

------------------------------------------------------------------------

## Page loads but actions do not work

Check that:

1.  Flask is running.
2.  Browser developer tools show no JavaScript errors.
3.  The static JavaScript file is loading.
4.  API requests are reaching the Flask server.
5.  The browser is accessing the same host/port where Flask is running.

------------------------------------------------------------------------

## Google Fonts do not load

The fonts are loaded from Google Fonts.

If there is no internet connection, the application will still render
using fallback fonts, but the exact visual appearance may differ.

------------------------------------------------------------------------

# Known Limitations

## 1. Five-level copy vs three-level frontend configuration

Several UI messages say:

``` text
5 levels
```

and:

``` text
Reach Level 5
```

The backend also supports levels 1--5.

However, the current JavaScript contains:

``` javascript
maxLevel: 3
```

Therefore the active frontend game is configured for three levels.

To enable all five levels, the frontend game configuration should be
changed to:

``` javascript
maxLevel: 5
```

The existing timer calculation and zone names already contain support
for levels 4 and 5.

------------------------------------------------------------------------

## 2. Timer documentation mismatch

The game briefing says:

``` text
23s → 43s
```

which describes five levels.

With the current `maxLevel: 3`, the active game only reaches:

``` text
23s → 33s
```

Changing `maxLevel` to `5` makes the five-level timer progression
consistent.

------------------------------------------------------------------------

## 3. Time boost text mismatch

The interface labels the boost as:

``` text
+ TIME
15 XP
```

and the JavaScript actually adds:

``` text
+10 seconds
```

The interface does not display the exact number of seconds before
activation.

------------------------------------------------------------------------

## 4. No persistent user accounts

Game progress exists only in browser memory while the page is active.

There is:

-   No database.
-   No login system.
-   No saved profile.
-   No persistent leaderboard.
-   No server-side XP storage.

Refreshing the page resets the active game.

------------------------------------------------------------------------

## 5. No automated test suite

The project currently does not include unit tests or integration tests.

Adding tests would improve confidence in:

-   Encryption.
-   Decryption.
-   Key wrapping.
-   API behavior.
-   Challenge generation.
-   Answer validation.

------------------------------------------------------------------------

## 6. English alphabet only

The cipher implementation is designed for the 26-letter English
alphabet.

It does not perform alphabet-aware Caesar transformations for scripts
such as:

-   Malayalam
-   Hindi
-   Arabic
-   Cyrillic
-   Greek

Non-English characters are generally left unchanged.

------------------------------------------------------------------------

# Suggested Improvements

The project can be extended in several useful directions.

## 1. Complete five-level mode

Change:

``` javascript
maxLevel: 3
```

to:

``` javascript
maxLevel: 5
```

Then verify the final-vault completion condition and mission text.

------------------------------------------------------------------------

## 2. Add automated tests

Example test cases:

``` text
encrypt("ABC", 3) == "DEF"
encrypt("XYZ", 3) == "ABC"
decrypt("DEF", 3) == "ABC"
decrypt("ABC", 3) == "XYZ"
encrypt("Hello World!", 3) == "Khoor Zruog!"
```

Also test:

-   Key `0`.
-   Key `25`.
-   Negative keys.
-   Mixed uppercase/lowercase text.
-   Numbers and punctuation.
-   Empty strings.

------------------------------------------------------------------------

## 3. Add a database

A database could store:

-   Player names.
-   XP.
-   Best scores.
-   Completed levels.
-   Best streak.
-   Accuracy.
-   Game history.

SQLite would be a natural first step for an educational Flask project.

------------------------------------------------------------------------

## 4. Add a leaderboard

A leaderboard could display:

``` text
Rank
Player
XP
Best Streak
Accuracy
```

This would require server-side score validation to avoid trivial
client-side manipulation.

------------------------------------------------------------------------

## 5. Improve server-side game validation

The server could generate a unique challenge ID and store:

``` text
challenge_id
expected_answer
level
created_at
```

The browser would submit:

``` json
{
  "challenge_id": "...",
  "submitted": "KHOOR"
}
```

The server would then determine correctness without trusting the
browser's expected answer.

------------------------------------------------------------------------

## 6. Add a Caesar Cipher visualizer

A useful educational enhancement would show:

``` text
ABCDEFGHIJKLMNOPQRSTUVWXYZ
   ↓ shift 3
DEFGHIJKLMNOPQRSTUVWXYZABC
```

Then highlight the selected plaintext and ciphertext letters.

This would make the mathematical transformation easier for beginners to
understand.

------------------------------------------------------------------------

## 7. Add frequency-analysis lessons

A more advanced lesson could explain why Caesar ciphers can also be
attacked using letter frequency.

For example:

``` text
English plaintext:
E is common

Ciphertext:
A appears unusually often
```

This would introduce the concept of classical cryptanalysis.

------------------------------------------------------------------------

# Educational Use

This project works well as a small classroom or self-study exercise
covering multiple concepts at once.

## Cryptography concepts

Students can learn:

-   Substitution ciphers.
-   Keys.
-   Encryption.
-   Decryption.
-   Brute force.
-   Key spaces.
-   Classical cryptanalysis.

## Python concepts

Students can inspect:

-   Functions.
-   Loops.
-   Conditionals.
-   Character encoding.
-   Modular arithmetic.
-   Lists and dictionaries.
-   Random selection.
-   Flask routes.
-   JSON responses.

## Web development concepts

Students can study:

-   HTML templates.
-   Jinja inheritance.
-   CSS.
-   DOM manipulation.
-   `fetch()`.
-   REST-style API endpoints.
-   JSON.
-   Browser state.
-   Responsive navigation.

------------------------------------------------------------------------

# License

No explicit license file is included in the supplied project.

If this project is intended for redistribution or open-source
publication, add a `LICENSE` file and specify the permitted use,
modification, and redistribution terms.

------------------------------------------------------------------------

# Quick Start

For the shortest possible setup:

``` bash
cd caesar_cipher_neumorphic
python -m venv .venv
```

Activate the environment:

``` bash
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

Install Flask:

``` bash
pip install -r requirements.txt
```

Start the app:

``` bash
python app.py
```

Open:

``` text
http://127.0.0.1:5000
```

Then:

1.  Enter **Crypto Quest**.
2.  Read the mission briefing.
3.  Solve the cipher challenges.
4.  Use the encryption/decryption pages for practice.
5.  Use brute force when the key is unknown.
6.  Review the source code to understand how the Caesar Cipher works.

------------------------------------------------------------------------

## Project Summary

**Caesar --- Crypto Quest** is a compact educational project that
combines a Flask backend, a vanilla JavaScript frontend, and a
game-based learning experience.

Its central lesson is simple:

``` text
Forward shift  → Encryption
Backward shift → Decryption
26 possible keys → Brute force
```

The application is intentionally small enough to understand end-to-end,
making it suitable for learning both basic cryptography and full-stack
web application fundamentals.
