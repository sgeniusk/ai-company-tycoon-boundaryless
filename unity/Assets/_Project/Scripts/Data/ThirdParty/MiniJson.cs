// JSON 원본 데이터를 Unity 에디터에서 읽기 위한 퍼블릭 도메인 MiniJSON 벤더 파일.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace MiniJSON
{
    public static class Json
    {
        public static object Deserialize(string json)
        {
            if (json == null)
            {
                return null;
            }

            return Parser.Parse(json);
        }

        public static string Serialize(object obj)
        {
            return Serializer.Serialize(obj);
        }

        private sealed class Parser : IDisposable
        {
            private const string WordBreak = "{}[],:\"";
            private readonly string json;
            private int index;

            private enum Token
            {
                None,
                CurlyOpen,
                CurlyClose,
                SquaredOpen,
                SquaredClose,
                Colon,
                Comma,
                String,
                Number,
                True,
                False,
                Null
            }

            private Parser(string json)
            {
                this.json = json;
            }

            public static object Parse(string json)
            {
                using (var instance = new Parser(json))
                {
                    return instance.ParseValue();
                }
            }

            public void Dispose()
            {
            }

            private Dictionary<string, object> ParseObject()
            {
                var table = new Dictionary<string, object>();
                NextToken();

                while (true)
                {
                    switch (LookAhead())
                    {
                        case Token.None:
                            return null;
                        case Token.Comma:
                            NextToken();
                            continue;
                        case Token.CurlyClose:
                            NextToken();
                            return table;
                    }

                    var name = ParseString();
                    if (name == null)
                    {
                        return null;
                    }

                    if (NextToken() != Token.Colon)
                    {
                        return null;
                    }

                    table[name] = ParseValue();
                }
            }

            private List<object> ParseArray()
            {
                var array = new List<object>();
                NextToken();

                var parsing = true;
                while (parsing)
                {
                    switch (LookAhead())
                    {
                        case Token.None:
                            return null;
                        case Token.Comma:
                            NextToken();
                            break;
                        case Token.SquaredClose:
                            NextToken();
                            parsing = false;
                            break;
                        default:
                            array.Add(ParseValue());
                            break;
                    }
                }

                return array;
            }

            private object ParseValue()
            {
                switch (LookAhead())
                {
                    case Token.String:
                        return ParseString();
                    case Token.Number:
                        return ParseNumber();
                    case Token.CurlyOpen:
                        return ParseObject();
                    case Token.SquaredOpen:
                        return ParseArray();
                    case Token.True:
                        NextToken();
                        return true;
                    case Token.False:
                        NextToken();
                        return false;
                    case Token.Null:
                        NextToken();
                        return null;
                    default:
                        return null;
                }
            }

            private string ParseString()
            {
                var builder = new StringBuilder();
                NextChar();

                var parsing = true;
                while (parsing)
                {
                    if (index == json.Length)
                    {
                        break;
                    }

                    var c = NextChar();
                    switch (c)
                    {
                        case '"':
                            parsing = false;
                            break;
                        case '\\':
                            if (index == json.Length)
                            {
                                parsing = false;
                                break;
                            }

                            c = NextChar();
                            switch (c)
                            {
                                case '"':
                                case '\\':
                                case '/':
                                    builder.Append(c);
                                    break;
                                case 'b':
                                    builder.Append('\b');
                                    break;
                                case 'f':
                                    builder.Append('\f');
                                    break;
                                case 'n':
                                    builder.Append('\n');
                                    break;
                                case 'r':
                                    builder.Append('\r');
                                    break;
                                case 't':
                                    builder.Append('\t');
                                    break;
                                case 'u':
                                    if (json.Length - index >= 4)
                                    {
                                        var hex = json.Substring(index, 4);
                                        builder.Append((char)Convert.ToInt32(hex, 16));
                                        index += 4;
                                    }
                                    break;
                            }
                            break;
                        default:
                            builder.Append(c);
                            break;
                    }
                }

                return builder.ToString();
            }

            private object ParseNumber()
            {
                var number = NextWord();
                if (number.IndexOf('.') == -1 && number.IndexOf('e') == -1 && number.IndexOf('E') == -1)
                {
                    long parsedInt;
                    if (long.TryParse(number, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsedInt))
                    {
                        return parsedInt;
                    }
                }

                double parsedDouble;
                double.TryParse(number, NumberStyles.Float, CultureInfo.InvariantCulture, out parsedDouble);
                return parsedDouble;
            }

            private void EatWhitespace()
            {
                while (index < json.Length && char.IsWhiteSpace(json[index]))
                {
                    index++;
                }
            }

            private char PeekChar()
            {
                return json[index];
            }

            private char NextChar()
            {
                return json[index++];
            }

            private string NextWord()
            {
                var wordStart = index;
                while (index < json.Length && !IsWordBreak(json[index]))
                {
                    index++;
                }

                return json.Substring(wordStart, index - wordStart);
            }

            private Token NextToken()
            {
                var token = LookAhead();
                switch (token)
                {
                    case Token.CurlyOpen:
                    case Token.CurlyClose:
                    case Token.SquaredOpen:
                    case Token.SquaredClose:
                    case Token.Colon:
                    case Token.Comma:
                        index++;
                        break;
                    case Token.String:
                    case Token.Number:
                        break;
                    case Token.True:
                    case Token.False:
                    case Token.Null:
                        NextWord();
                        break;
                }

                return token;
            }

            private Token LookAhead()
            {
                EatWhitespace();
                if (index == json.Length)
                {
                    return Token.None;
                }

                switch (PeekChar())
                {
                    case '{':
                        return Token.CurlyOpen;
                    case '}':
                        return Token.CurlyClose;
                    case '[':
                        return Token.SquaredOpen;
                    case ']':
                        return Token.SquaredClose;
                    case ',':
                        return Token.Comma;
                    case '"':
                        return Token.String;
                    case ':':
                        return Token.Colon;
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                    case '-':
                        return Token.Number;
                }

                var savedIndex = index;
                var word = NextWord();
                index = savedIndex;
                switch (word)
                {
                    case "false":
                        return Token.False;
                    case "true":
                        return Token.True;
                    case "null":
                        return Token.Null;
                    default:
                        return Token.None;
                }
            }

            private static bool IsWordBreak(char c)
            {
                return char.IsWhiteSpace(c) || WordBreak.IndexOf(c) != -1;
            }
        }

        private sealed class Serializer
        {
            private readonly StringBuilder builder;

            private Serializer()
            {
                builder = new StringBuilder();
            }

            public static string Serialize(object obj)
            {
                var instance = new Serializer();
                instance.SerializeValue(obj);
                return instance.builder.ToString();
            }

            private void SerializeValue(object value)
            {
                var valueString = value as string;
                if (valueString != null)
                {
                    SerializeString(valueString);
                }
                else if (value == null)
                {
                    builder.Append("null");
                }
                else if (value is bool)
                {
                    builder.Append((bool)value ? "true" : "false");
                }
                else if (value is IList)
                {
                    SerializeArray((IList)value);
                }
                else if (value is IDictionary)
                {
                    SerializeObject((IDictionary)value);
                }
                else if (value is char)
                {
                    SerializeString(new string((char)value, 1));
                }
                else
                {
                    SerializeOther(value);
                }
            }

            private void SerializeObject(IDictionary obj)
            {
                var first = true;
                builder.Append('{');
                foreach (object key in obj.Keys)
                {
                    if (!first)
                    {
                        builder.Append(',');
                    }

                    SerializeString(key.ToString());
                    builder.Append(':');
                    SerializeValue(obj[key]);
                    first = false;
                }

                builder.Append('}');
            }

            private void SerializeArray(IList array)
            {
                builder.Append('[');
                for (var i = 0; i < array.Count; i++)
                {
                    if (i > 0)
                    {
                        builder.Append(',');
                    }

                    SerializeValue(array[i]);
                }

                builder.Append(']');
            }

            private void SerializeString(string str)
            {
                builder.Append('"');
                foreach (var c in str.ToCharArray())
                {
                    switch (c)
                    {
                        case '"':
                            builder.Append("\\\"");
                            break;
                        case '\\':
                            builder.Append("\\\\");
                            break;
                        case '\b':
                            builder.Append("\\b");
                            break;
                        case '\f':
                            builder.Append("\\f");
                            break;
                        case '\n':
                            builder.Append("\\n");
                            break;
                        case '\r':
                            builder.Append("\\r");
                            break;
                        case '\t':
                            builder.Append("\\t");
                            break;
                        default:
                            var codepoint = Convert.ToInt32(c);
                            if (codepoint >= 32 && codepoint <= 126)
                            {
                                builder.Append(c);
                            }
                            else
                            {
                                builder.Append("\\u");
                                builder.Append(codepoint.ToString("x4"));
                            }
                            break;
                    }
                }

                builder.Append('"');
            }

            private void SerializeOther(object value)
            {
                if (value is float || value is int || value is uint || value is long || value is double || value is sbyte || value is byte || value is short || value is ushort || value is ulong || value is decimal)
                {
                    builder.Append(Convert.ToString(value, CultureInfo.InvariantCulture));
                }
                else
                {
                    SerializeString(value.ToString());
                }
            }
        }
    }
}
