<p align="center">
  <img src="./resources/icons/icon.png" alt="esbuild: An extremely fast JavaScript bundler">
    <h1 style="text-align:center">Vite Esbuild Electron Template</h1>
</p>

Uses vite for building and serving renderer process and esbuild for building main process, with communication of main and renderer process is done in custom way. See below to know more.

## Usage

1. Clone this repositroy
2. Run `npm install` or `yarn`
3. Run `npm run dev` or `yarn dev`
4. Fun!

## How to use and how to communicate processes

There are a **Actions** in main process that must be extended from abstract class **ActionHandler**. Every action must be exported in _src/Actions/index.ts_. _([Example of implemented ActionHandler]("https://github.com/devdotcoded/vite-esbuild-electron-temaple/blob/main/src/main/src/Actions/messages/SendMessageHandler.ts"))_.

All action handler must be implement **handle** method that is used to handle event called from render process, and **getAction** method that returns the class of action.

The comunication between main and render process is done by DTOs. _([Example of DTO](https://github.com/devdotcoded/vite-esbuild-electron-temaple/blob/main/src/common/src/domain/actions/messages/SendMessage.ts))._ Every DTO represents an action or event, and his name it's that will be use as event channel.

Actions have a **emit** method to send data to renderer process asyncronously, for example in a setTimeout or setInterval.

In render process, you should use the custom hook **useAction** to call an action or **onAction** hook to listen to an action. _([Example of useAction and onAction hooks](https://github.com/devdotcoded/vite-esbuild-electron-temaple/blob/main/src/render/app.tsx))._

It is implemented in react, but will works with any modern js/ts framework.

Enjoy!!! :)
