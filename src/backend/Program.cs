using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.IO.Pipes;
using System.Security.Principal;
using System.Text.Json;
using System.Globalization;

namespace IPCDemo.CS
{
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

      for (var s = socketClient.Read(); socketClient.IsConnected; s = socketClient.Read())
      {
        var num = int.Parse(s.Args[0], CultureInfo.InvariantCulture);
        num += 1;
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