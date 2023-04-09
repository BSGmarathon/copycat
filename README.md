# copycat
Program that copies game + title from 1 twitch account to the other, and plays ads on every change.

# Setup
Modern NodeJS is required.

Go to [dev.twitch.tv](https://dev.twitch.tv) and register an application.

Rename `example.env` to simply `.env` and fill in the `CLIENT_ID` from the earlier website inbetween the apostrohies.
Then visit [The tokengen page](https://twitchapps.com/tokengen/) and get authentication for the following scopes: `channel_editor channel:manage:broadcast channel:edit:commercial`

After that, fill in the twitch channel IDs for both the reader (channel information gets read from) as well as the target (channel which receives the information). And the interval in minutes how often the program should check for a game change.

# Just run
```bash
node copycat.js
```
# Acknowledgement
This program was tailor-made for BSG, and therefore is made with the idea that the user of this app owns the Twitch-account that gets all the changes. You do not need access to the account that stuff gets pulled from. Unsure if this works the other way (especially since Twitch API V6 broke a lot of permissions via API).

# Author
Made by [Riekelt / Riek-lt](https://github.com/riek-lt)
