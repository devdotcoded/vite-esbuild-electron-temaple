import { EVENTS } from "@common/events";
import React, { useEffect, useState } from "react";
import { useAction, useWaitForAction } from "./hooks/api";

export default () => {
  const [log, setLog] = useState("");
  const [message, setMessage] = useState("");
  const sendMsgToMainProcess = useAction<string>(EVENTS.SEND_MSG);

  useEffect(
    () =>
      useWaitForAction<string>(EVENTS.SEND_MSG, (msg) => {
        setLog(`${log}[main]: ${msg}  </br>`);
      }),
    []
  );

  const sendMsg = async () => {
    try {
      setLog(`${log}[render]: ${message} </br>`);
      const { data } = await sendMsgToMainProcess(message);
      setLog(`[main]: ${data}  </br>`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1>Hello, world!</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMsg}>Send</button>
      <div>{log}</div>
    </>
  );
};
