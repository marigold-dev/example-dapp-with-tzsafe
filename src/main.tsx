import { Buffer as BufferPolyfill } from "buffer";
import { Stream as StreamPolyfill } from "stream";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

declare const Buffer: typeof BufferPolyfill;
declare const Stream: typeof StreamPolyfill;

globalThis.Buffer = BufferPolyfill;
globalThis.Stream = StreamPolyfill;
globalThis.Transform = Stream.Transform;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
