using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.IO.Pipes;
using System.Security.Principal;
using System.Text.Json;
using System.Globalization;

namespace Corona.Utils.BGMTrackEditor
{
  [SuppressMessage("Code Quality", "CA1819:Properties should not return arrays")]
  public record Msg(string Caller, string Callee, string[] Args) { }

  public static class Program
  {
    public static void Main(string[] args)
    {
      // 根据传入的命令行参数，连接到对应的命名管道
      using var socketClient =
          new NamedPipeClientStream(".", args[0],
              PipeDirection.InOut, PipeOptions.None,
              TokenImpersonationLevel.Impersonation);
      socketClient.Connect();

      // 创建自己的命名管道，并将命名管道的名称交给对方
      var socketServerAddress = Guid.NewGuid().ToString();
      using var socketServer = new NamedPipeServerStream(socketServerAddress, PipeDirection.InOut, 1);
      socketClient.Write(new Msg
      (
        Caller: "cs-" + Guid.NewGuid().ToString(),
        Callee: "$shakehand",
        Args: new[] { socketServerAddress }
      ));
      socketServer.WaitForConnection();

      for (var s = socketServer.Read(); socketClient.IsConnected; s = socketServer.Read())
      {
        var num = int.Parse(s.Args[0], CultureInfo.InvariantCulture);
        num += 7;
        socketClient.Write(new Msg
        (
          Caller: s.Caller,
          Callee: s.Callee,
          Args: new[] { num.ToString(CultureInfo.InvariantCulture) }
        ));
      }
    }
  }

  internal static class StreamExtensions
  {
    private static readonly JsonSerializerOptions s_jsonOptions = new()
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static Msg Read(this Stream ioStream)
    {
      var len = ioStream.ReadByte() * 256 + ioStream.ReadByte();
      var inBuffer = new byte[len];
      ioStream.Read(inBuffer, 0, len);

      return JsonSerializer.Deserialize<Msg>(inBuffer, s_jsonOptions)!;
    }

    public static int Write(this Stream ioStream, Msg msg)
    {
      var outBuffer = JsonSerializer.SerializeToUtf8Bytes(msg, s_jsonOptions);
      var len = outBuffer.Length;
      ioStream.WriteByte((byte)(len / 256));
      ioStream.WriteByte((byte)(len % 256));
      ioStream.Write(outBuffer, 0, len);
      ioStream.Flush();

      return outBuffer.Length + 2;
    }
  }
}

