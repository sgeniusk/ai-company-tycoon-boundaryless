// 시드 가능한 난수 추상화 — 이벤트 추첨을 결정적으로 테스트하기 위함이다.
using System;

namespace AICompanyTycoon.Systems
{
    public interface IRng
    {
        double NextDouble();
    }

    public sealed class SeededRng : IRng
    {
        readonly Random _r;
        public SeededRng(int seed) { _r = new Random(seed); }
        public double NextDouble() => _r.NextDouble();
    }
}
