# CodinGame Starter for Typescript

A project template and utils for CodinGame challenges. It compiles several typescript files into one JS file.

## Usage


### Implementations

Edit the code in `src/` to implement your solution:

- `solution/solution.ts` is the entry point of the bot.
- `parsing/` contains the function used to convert stdin to GameState and GameState to stdout.
- `gamerules/` contains the game and game rules. Complete the Game class with the challenge specific rules and victory
conditions.
- Once your gamerules are implemented, you can edit the `arena.ts` script to start a game. This script will be started
by the arena to make the bot battle other bots (using `pnpm run arena -p1 <script> -p2 <script>`).

### Build

To build your solution into one JS file (watch mode), use:

```
pnpm run build
```

It will output the JS content into `dist/main.js`. It will also create a backup of this build for the current git hash
in the `bots/` directory.

### Arena

You can start an arena based on your game rules and make bots battle against each other by using:

```
pnpm run arena -p1 bots/<hash>.js -p2 bots/<hash>.js
```

For more information, use the help option:

```
pnpm run arena --help
```

