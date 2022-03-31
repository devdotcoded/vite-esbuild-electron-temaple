import { EVENTS } from "@common/events";
import React, { useEffect, useState } from "react";
import { useAction, useWaitForAction } from "./hooks/api";

export default () => {
  const [log, setLog] = useState("");
  const [message, setMessage] = useState("");
  const sendMsgToMainProcess = useAction<string>(EVENTS.SEND_MSG);
  const onMessageRecived = useWaitForAction<string>(EVENTS.REPLY_MSG);

  useEffect(
    () =>
      onMessageRecived((msg) => setLog((prev) => `${prev}[main]: ${msg}  \n`)),
    []
  );

  const sendMsg = async () => {
    try {
      setLog((prev) => `${prev}[render]: ${message} \n`);
      const { data } = await sendMsgToMainProcess(message);
      setLog((prev) => `${prev}[main]: ${data}  \n`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <h1>Hello, world!</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMsg}>Send</button>
      <div>{log}</div>
    </main>
  );
};
