# BoxFit Multiplayer Collaborative Puzzle Game

A real-time collaborative multiplayer game where players work together to fit and place differently shaped items into a shared 10×10 grid container. This React app uses Yjs for conflict-free shared state synchronization and a WebSocket server for realtime collaboration.

## Features

- **Fixed 10×10 shared grid** representing the box container.
- **Shape item selection, rotation, and placement** with collision and grid-boundary rules.
- **Real-time synchronization across multiple players** using [Yjs](https://yjs.dev/) and a WebSocket provider.
- **Live scoring system** awarding points for valid placements.
- **Player list with clickable names** to scroll and highlight their placed pieces on the grid.
- **Visual separation indicator**: a vertical border divides the grid into two player areas.
- Modern, dark-themed responsive UI with preview and scoreboards.

## Demo

*(You can deploy this with your own Yjs websocket server or run locally. No public demo available by default.)*

## Installation and Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- npm (comes with Node.js)

### Setup

1. Clone or download this repository to your local machine.

2. Install required dependencies:

```bash
npm install
```

3. Install Yjs websocket server dependency:

```bash
npm install @y/websocket-server yjs y-websocket react react-dom
```

4. Run the Yjs WebSocket server locally (this server enables realtime collaboration):

```bash
npx @y/websocket-server --port 1234
```

Leave this running in a terminal window.

5. Start your React development server (assuming create-react-app or similar):

```bash
npm start
```

## Usage

- Open your app in one or more browser windows or devices on the same network.
- The app automatically connects to your local websocket server at `ws://localhost:1234`.
- Select a piece from the **Pieces** panel.
- Rotate the piece by clicking the **Rotate** button.
- Hover over the grid to preview valid placement positions.
- Click an empty grid cell to place the piece.
- Scores update live for all players.
- In the **Players** list, click on a player’s name to scroll and highlight their placed pieces.
- The grid has a vertical golden border visually separating two player areas.

## Folder Structure

- `src/`
  - `BoxFitGame.jsx` — Main React component for the game UI and logic.
  - Other standard React boilerplate files.

## Technologies Used

- **React** — Frontend UI framework.
- **Yjs** — CRDT-based real-time collaboration engine.
- **@y/websocket-server** — WebSocket server for Yjs document sync.
- **JavaScript (JSX)** — Implementation language.

## Customization

- Change the server URL in `BoxFitGame.jsx` inside the `WebsocketProvider` constructor:

```js
new WebsocketProvider("ws://localhost:1234", "boxfit-room", ydoc);
```

- Add more shapes in the `SHAPES` array.
- Adjust grid size by editing `GRID_SIZE`.
- Modify scoring logic in `handlePlace` method.
- Style adjustments via inline styles in `BoxFitGame.jsx`.

## Next Steps / Possible Enhancements

- Undo/redo support using Yjs version history.
- Player presence indicators and ghost cursors.
- Chat box integration for player communication.
- Authentication and persistent user accounts.
- Persistent storage of game history and scores on backend.
- Deploy WebSocket server to cloud or private network.

## Troubleshooting

### WebSocket connection errors

- Ensure the Yjs websocket server is running before launching the React app.
- Check the WebSocket URL matches your running server.
- On firewall or network-restricted environments, open required ports.

### Permission errors installing `@y/websocket-server`

- Use `npx` instead of global install to avoid permission issues:

```bash
npx @y/websocket-server --port 1234
```

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Yjs](https://yjs.dev/) for enabling excellent realtime collaboration technology.
- Inspiration from multiplayer grid puzzle games like BoxFit.

If you need help deploying or customizing the app, feel free to raise issues or contact the maintainer.

**Enjoy collaborating and fitting together!** 🎮📦

Let me know if you want me to generate the README in markdown `.md` file format or any other formatting style!