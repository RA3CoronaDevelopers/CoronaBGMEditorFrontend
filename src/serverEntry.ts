declare global {
  function receive(receiver: (msg: any) => void): void;
  function send(msg: any): void;
}

export {};

const middlewares: {
  [type: string]: (data: any) => Promise<void>
} = {

};
receive((msg: any) => {
  if (!msg.type) {
    console.error('WS: 不合法的包裹', msg);
  } else if (!middlewares[msg.type]) {
    console.error('WS: 未注册的包裹类型', msg.type);
  } else {
    middlewares[msg.type](msg);
  }
});
