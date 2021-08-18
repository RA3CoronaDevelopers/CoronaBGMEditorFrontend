using System;
using System.IO.Pipes;
using System.Security.Principal;
using System.Text.Json;

namespace Corona.Utils.BGMTrackEditor
{
  public class IMsg
  {
    public string caller { get; set; }
    public string callee { get; set; }
    public string[] args { get; set; }
  }

  public class Entry
  {
    public static void Main(string[] args)
    {
      // 根据传入的命令行参数，连接到对应的命名管道
      var socketClient =
          new NamedPipeClientStream(".", args[0],
              PipeDirection.InOut, PipeOptions.None,
              TokenImpersonationLevel.Impersonation);
      socketClient.Connect();
      var socketClientStream = new Stream(socketClient);

      // 创建自己的命名管道，并将命名管道的名称交给对方
      string socketServerAddress = Guid.NewGuid().ToString();
      var socketServer = new NamedPipeServerStream(socketServerAddress, PipeDirection.InOut, 1);
      var socketServerStream = new Stream(socketServer);
      socketClientStream.Write(new IMsg
      {
        caller = "cs-" + Guid.NewGuid().ToString(),
        callee = "$shakehand",
        args = new string[1] { socketServerAddress }
      });
      socketServer.WaitForConnection();

      for (var s = socketServerStream.Read(); socketClient.IsConnected; s = socketServerStream.Read())
      {
        int num = Convert.ToInt32(s.args[0]);
        num += 1;
        socketClientStream.Write(new IMsg
        {
          caller = s.caller,
          callee = s.callee,
          args = new string[1] { Convert.ToString(num) }
        });
      }

      socketClient.Close();
      socketServer.Close();
    }
  }

  public class Stream
  {
    private System.IO.Stream ioStream;

    public Stream(System.IO.Stream ioStream)
    {
      this.ioStream = ioStream;
    }

    public IMsg Read()
    {
      int len = ioStream.ReadByte() * 256 + ioStream.ReadByte();
      var inBuffer = new byte[len];
      ioStream.Read(inBuffer, 0, len);

      return JsonSerializer.Deserialize<IMsg>(inBuffer);
    }

    public int Write(IMsg msg)
    {
      byte[] outBuffer = JsonSerializer.SerializeToUtf8Bytes(msg);
      int len = outBuffer.Length;
      ioStream.WriteByte((byte)(len / 256));
      ioStream.WriteByte((byte)(len % 256));
      ioStream.Write(outBuffer, 0, len);
      ioStream.Flush();

      return outBuffer.Length + 2;
    }
  }
}