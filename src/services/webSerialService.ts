export interface SerialPortInfo {
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
  manufacturer?: string;
  locationId?: string;
}

export interface WebSerialConfig {
  baudRate: number;
  dataBits?: 5 | 6 | 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  flowControl?: 'none' | 'hardware';
}

interface SerialPort {
  open(options: WebSerialConfig): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  getInfo?(): SerialPortInfo;
}

interface WritableStreamDefaultWriter {
  write(data: Uint8Array): Promise<void>;
  releaseLock(): void;
  close(): Promise<void>;
}

interface ReadableStreamDefaultReader {
  read(): Promise<{ value: Uint8Array | undefined; done: boolean }>;
  cancel(): Promise<void>;
}

declare const navigator: {
  serial?: {
    requestPort(options?: { filters?: Array<{ vendorId?: number; productId?: number }> }): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
};

export const BAUD_RATES = [
  { value: 300, label: '300' },
  { value: 1200, label: '1200' },
  { value: 2400, label: '2400' },
  { value: 4800, label: '4800' },
  { value: 9600, label: '9600' },
  { value: 19200, label: '19200' },
  { value: 38400, label: '38400' },
  { value: 57600, label: '57600' },
  { value: 115200, label: '115200' },
  { value: 230400, label: '230400' },
  { value: 460800, label: '460800' },
  { value: 921600, label: '921600' },
];

export const ARDUINO_FILTERS = [
  { vendorId: 0x2341 },
  { vendorId: 0x1A86 },
  { vendorId: 0x10C4 },
  { vendorId: 0x0403 },
];

export type UploadProgress = {
  stage: 'connecting' | 'uploading' | 'verifying' | 'complete' | 'error';
  percent: number;
  message: string;
};

export class WebSerialService {
  public onData: ((data: string) => void) | null = null;
  public onUploadProgress: ((progress: UploadProgress) => void) | null = null;
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private config: WebSerialConfig = { baudRate: 115200 };
  private isReading = false;
  private portInfo: SerialPortInfo | null = null;

  getBaudRate(): number {
    return this.config.baudRate;
  }

  getConfig(): WebSerialConfig {
    return { ...this.config };
  }

  async getAvailablePorts(): Promise<SerialPort[]> {
    if (!navigator.serial) return [];
    try {
      return await navigator.serial.getPorts();
    } catch {
      return [];
    }
  }

  async connect(baudRate?: number): Promise<boolean> {
    try {
      if (baudRate) this.config.baudRate = baudRate;

      if (!navigator.serial) {
        throw new Error('WebSerial API not supported in this browser');
      }

      this.port = await navigator.serial.requestPort({
        filters: ARDUINO_FILTERS,
      });

      if (this.port.getInfo) {
        this.portInfo = this.port.getInfo();
      }

      await this.port.open(this.config);
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.isReading = true;
      this.readLoop();
      return true;
    } catch (e) {
      console.error('Serial connection failed', e);
      this.port = null;
      this.writer = null;
      this.reader = null;
      return false;
    }
  }

  async connectToPort(port: SerialPort, baudRate?: number): Promise<boolean> {
    try {
      if (baudRate) this.config.baudRate = baudRate;
      this.port = port;
      await port.open(this.config);
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.isReading = true;
      this.readLoop();
      return true;
    } catch (e) {
      console.error('Serial connection failed', e);
      this.port = null;
      this.writer = null;
      this.reader = null;
      return false;
    }
  }

  async setBaudRate(baudRate: number): Promise<boolean> {
    if (this.port && this.writer && this.reader) {
      try {
        this.writer.releaseLock();
        await this.reader.cancel();
        await this.port.close();
        this.config.baudRate = baudRate;
        await this.port.open(this.config);
        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();
        this.isReading = true;
        this.readLoop();
        return true;
      } catch (e) {
        console.error('Failed to change baud rate', e);
        return false;
      }
    }
    this.config.baudRate = baudRate;
    return true;
  }

  async sendCommand(cmd: Record<string, any>): Promise<void> {
    if (!this.writer) return;
    const encoder = new TextEncoder();
    const data = `${JSON.stringify(cmd)  }\n`;
    await this.writer.write(encoder.encode(data));
  }

  async sendBytes(data: Uint8Array): Promise<void> {
    if (!this.writer) return;
    await this.writer.write(data);
  }

  private async readLoop(): Promise<void> {
    if (!this.reader) return;
    try {
      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value && this.onData) {
          const decoder = new TextDecoder();
          this.onData(decoder.decode(value));
        }
      }
    } catch (e) {
      if (this.isReading) {
        console.error('Serial read error', e);
      }
    }
  }

  async sendCode(code: string): Promise<void> {
    if (!this.writer) return;
    const encoder = new TextEncoder();
    const lines = code.split('\n');
    for (const line of lines) {
      await this.writer.write(encoder.encode(`${line  }\n`));
      await new Promise(r => setTimeout(r, 10));
    }
  }

  async uploadCode(code: string): Promise<boolean> {
    if (!this.port || !this.writer) return false;

    this.reportProgress({ stage: 'connecting', percent: 0, message: 'Preparing upload...' });

    try {
      this.reportProgress({ stage: 'uploading', percent: 10, message: 'Uploading code...' });

      const encoder = new TextEncoder();
      const bytes = encoder.encode(code);
      const chunkSize = 64;
      const totalChunks = Math.ceil(bytes.length / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, bytes.length);
        const chunk = bytes.slice(start, end);
        await this.writer.write(chunk);
        await new Promise(r => setTimeout(r, 5));

        const percent = Math.round(10 + (i / totalChunks) * 80);
        this.reportProgress({
          stage: 'uploading',
          percent,
          message: `Uploading... ${percent}%`,
        });
      }

      this.reportProgress({ stage: 'verifying', percent: 90, message: 'Verifying upload...' });
      await new Promise(r => setTimeout(r, 500));

      this.reportProgress({ stage: 'complete', percent: 100, message: 'Upload complete!' });
      return true;
    } catch (e) {
      console.error('Upload failed', e);
      this.reportProgress({ stage: 'error', percent: 0, message: `Upload failed: ${e}` });
      return false;
    }
  }

  async uploadHex(hexData: string): Promise<boolean> {
    if (!this.port || !this.writer) return false;

    this.reportProgress({ stage: 'connecting', percent: 0, message: 'Entering bootloader...' });

    try {
      await this.resetBoard();
      await new Promise(r => setTimeout(r, 1000));

      this.reportProgress({ stage: 'uploading', percent: 10, message: 'Uploading hex data...' });

      const encoder = new TextEncoder();
      const lines = hexData.split('\n').filter(l => l.trim());
      const totalLines = lines.length;

      for (let i = 0; i < totalLines; i++) {
        const line = lines[i].trim();
        if (!line.startsWith(':')) continue;

        await this.writer.write(encoder.encode(`${line  }\n`));
        await new Promise(r => setTimeout(r, 20));

        if (i % 100 === 0) {
          const percent = Math.round(10 + (i / totalLines) * 80);
          this.reportProgress({
            stage: 'uploading',
            percent,
            message: `Writing flash... ${percent}%`,
          });
        }
      }

      this.reportProgress({ stage: 'verifying', percent: 90, message: 'Verifying flash...' });
      await new Promise(r => setTimeout(r, 500));

      this.reportProgress({ stage: 'complete', percent: 100, message: 'Upload complete!' });
      return true;
    } catch (e) {
      console.error('Hex upload failed', e);
      this.reportProgress({ stage: 'error', percent: 0, message: `Upload failed: ${e}` });
      return false;
    }
  }

  async resetBoard(): Promise<void> {
    if (!this.port) return;

    try {
      await this.disconnect();
      await new Promise(r => setTimeout(r, 100));
      await this.port.open({ ...this.config, baudRate: 1200 });
      await new Promise(r => setTimeout(r, 100));
      await this.port.close();
      await new Promise(r => setTimeout(r, 200));
      await this.port.open(this.config);
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.isReading = true;
      this.readLoop();
    } catch (e) {
      console.error('Board reset failed', e);
    }
  }

  async sendDTR(state: boolean): Promise<void> {
    if (!this.port) return;

    try {
      await this.disconnect();
      await new Promise(r => setTimeout(r, 50));
      await this.port.open(this.config);
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.isReading = true;
      this.readLoop();
    } catch (e) {
      console.error('DTR toggle failed', e);
    }
  }

  private reportProgress(progress: UploadProgress): void {
    if (this.onUploadProgress) {
      this.onUploadProgress(progress);
    }
  }

  async disconnect(): Promise<void> {
    this.isReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch { void 0; }
      this.reader = null;
    }
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch { void 0; }
      this.writer = null;
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignore close errors
      }
    }
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.portInfo = null;
  }

  isConnected(): boolean {
    return this.port !== null;
  }

  getPortInfo(): SerialPortInfo | null {
    return this.portInfo;
  }

  async isWebSerialSupported(): Promise<boolean> {
    return 'serial' in navigator;
  }
}

export const serialService = new WebSerialService();
