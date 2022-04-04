import { ReplyMessage } from "@common/src/domain/actions/messages/ReplyMessage";
import {
  SendMessage,
  SendMessageResponse,
} from "@common/src/domain/actions/messages/SendMessage";
import { ActionHandler } from "@main/src/infraestructure/AbstractActionHandler";

export class SendMessageHandler extends ActionHandler<
  SendMessage,
  SendMessageResponse
> {
  getAction() {
    return SendMessage;
  }

  async handle({ message }: SendMessage): Promise<SendMessageResponse> {
    setTimeout(() => {
      this.sendAsyncAwesomeMessage("Awesome message ;)");
    }, 2000);

    return {
      message: `Hello from the other side!: ${message}`,
    };
  }

  private sendAsyncAwesomeMessage(message: string): void {
    this.emit(new ReplyMessage(message));
  }
}
