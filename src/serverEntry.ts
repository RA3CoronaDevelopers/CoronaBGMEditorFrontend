declare global {
  function receive(receiver: (msg: any) => void): void;
  function send(msg: any): void;
}

export {};
