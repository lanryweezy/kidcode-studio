export class WebSerialService {
  private port: any | null = null;
  private writer: any | null = null;
  private reader: any | null = null;

  async connect() {
    try {
      // @ts-ignore - Web Serial API is experimental
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      return true;
    } catch (e) {
      console.error("Serial connection failed", e);
      return false;
    }
  }

  async sendCommand(cmd: any) {
    if (!this.writer) return;
    const encoder = new TextEncoder();
    const data = JSON.stringify(cmd) + "\n";
    await this.writer.write(encoder.encode(data));
  }

  async disconnect() {
    if (this.reader) await this.reader.cancel();
    if (this.writer) this.writer.releaseLock();
    if (this.port) await this.port.close();
    this.port = null;
    this.writer = null;
    this.reader = null;
  }

  isConnected() {
    return this.port !== null;
  }
}

export const serialService = new WebSerialService();
