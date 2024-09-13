# export-helpers

## What it does

This extension demonstrates a technique that developers can use to help debug issues related to event-based (or "evented") background contexts such as event pages or service workers. It exposes a "background console" page that will show messages sent by the background context across lifetimes. It also shows whether or not the background context is currently running in order to aid in diagnosing startup and termination issues.

In Manifest V3, all extensions use an evented background context that is started in response to events and terminated when idle. At the time of writing (2024-09-13) the default lifetime of an evented background context is 30 seconds, but this is an implementation detail and should not be considered a reliable, fixed value. Browsers also extend the lifetime of an evented background context when certain APIs are used.

## How it works

There are two main parts of this extension:

* A "background console" page that displays messages sent from the background context. (See `console/`.)
* A background library that exposes a `log()()` function that will send messages to the background console page. (See `lib/bg-log-wrapper.js`.)

Messages are passed from the background to the console using a `BroadcastChannel`. This web messaging API does not affect the lifetime of the extension's background context. That allows us to observe the background's running state without directly affecting it.

The `bg-log-wrapper` library supports two types of messages: "log" and "heartbeat". Log messages are passed to the console and written as they are received. Heartbeat messages are only used to check whether or not the background is "alive" (currently running). The console infers when the background starts and stops based on the presence or absence of these messages.

## How to use it

To see the extension in action:

1. Install the extension
2. Trigger the extension's action
3. A new page will open showing the console.

Click the action again to trigger make the background send a message to the console. This will also restart the background if it is not currently running.
