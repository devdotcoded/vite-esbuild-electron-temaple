import { ReplyMessage } from "@common/src/domain/actions/messages/ReplyMessage";
import {
  SendMessage,
  SendMessageResponse,
} from "@common/src/domain/actions/messages/SendMessage";
import { onAction, useAction } from "@render/hooks/api";
import React, { useEffect, useState } from "react";

export default () => {
  const [log, setLog] = useState("");
  const [message, setMessage] = useState("");
  const sendMsgToMainProcess = useAction<SendMessage, SendMessageResponse>(
    SendMessage
  );
  const onMessageRecived = onAction(ReplyMessage);

  useEffect(
    () =>
      onMessageRecived((msg) =>
        setLog(
          (prev) =>
            `${prev}Reviced from main Process asyncronisly: ${msg.message}  \n`
        )
      ),
    []
  );

  const sendMsg = async () => {
    try {
      setLog((prev) => `${prev}Sending to main process: ${message} \n`);

      const response = await sendMsgToMainProcess(new SendMessage(message));

      setLog((prev) => `${prev}Reciving from main: ${response.message}  \n`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <h1>Hello, world!</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMsg}>Send</button>
      </div>
      <textarea
        style={{ width: "100%" }}
        value={log}
        cols={30}
        rows={10}
        disabled
      />
    </main>
  );
};
