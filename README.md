# copycat
Program that copies game + title from 1 twitch account to the other, and plays ads on every change.

# Setup
Go to [dev.twitch.tv](dev.twitch.tv) and register an application.

Rename `example.env` to simply `.env` and fill in the `CLIENT_ID` from the earlier website inbetween the apostrohies.
Then visit [Twitch's Tokengen](https://twitchapps.com/tokengen/) and get authentication for all 3 scopes that are commented out in `.env`.

After that, fill in the twitch channel IDs for both the reader (channel information gets read from) as well as the target (channel which receives the information). And the interval in minutes how often the program should check for a game change.

# Just run
```bash
node copycat.js
```
