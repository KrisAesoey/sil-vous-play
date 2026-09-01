# S'il vous play: Local music player

Play, build and enjoy a local music library

## What is this

S'il vous play is an audio playing app that makes it easier to interact with your local
music library. Load the directory where you store your music files, and enjoy 

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run in development mode:
   ```bash
   bun run dev
   ```

So far only tested on Windows 11 and macOS 26 Tahoe.

## Usage

Start up the program and select a folder that will serve as the root of your library tree.
Any audio files in this directory will be ignored, while sub directories will be considered your albums.
After you have selected the root a set of metadata files will be generated allowing you to easily interact
with your library.

Metadata for albums and the library can be changes at your own risk. Updating titles and track order can
be done by editing the `.metadata.json` file in each album directory.

Any persistent data stored by the application can be found in your OS' default user data folder for the app.

## Project Structure

```
src/
├── bun/
│   └── index.ts      # Main process - creates and manages windows
├── mainview/
│   ├── components/   # React components building the UI (player, album table etc)
│   ├── userSettings/ # Context for users permanent settings
│   └── playback/     # Context for keeping track of current music playing
└── shared/           # Types, functions and configs shared between the main process and the view
scripts/              # Scripts used for testing specific parts of the application
```

### Roadmap

* Shuffle
* Queues
* Support for artist directories
* Edit mode (change titles, artists, and other metadata)
* Playlists

Happy listening! 🎧