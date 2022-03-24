import { EVENTS } from "@common/events";
import { Controller, IpcEmit, IpcInvoke } from "../decorators";
import { MyService } from "../Services/MyService";

@Controller()
export class MyController {
  constructor(private myService: MyService) {}

  @IpcEmit(EVENTS.REPLY_MSG)
  public replyMsg(msg: string) {
    return `${this.myService.getDelayTime()} seconds later, the main process replies to your message: ${msg}`;
  }

  @IpcInvoke(EVENTS.SEND_MSG)
  public async handleSendMsg(msg: string): Promise<string> {
    setTimeout(() => {
      this.replyMsg(msg);
    }, this.myService.getDelayTime() * 1000);

    return `The main process received your message: ${msg}`;
  }
}
