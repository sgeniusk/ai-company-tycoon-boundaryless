// 시장 점유율을 derive-only 데이터(getPlayerMarketShare + competitorStates[].marketShare)로 시각화하는 v0.58 #1 HUD 패널
import type { CSSProperties } from "react";
import { competitors } from "../game/data";
import { getCompetitionSeasonBrief } from "../game/competition-signals";
import { getPlayerMarketShare } from "../game/simulation";
import type { GameState } from "../game/types";
import { t, type LocaleCode } from "../i18n";

export function MarketSharePanel({ gameState, locale }: { gameState: GameState; locale: LocaleCode }) {
  const playerShare = getPlayerMarketShare(gameState);
  const competitorShares = [...gameState.competitorStates]
    .map((cstate) => {
      const definition = competitors.find((c) => c.id === cstate.id);
      return {
        id: cstate.id,
        name: definition ? t(definition.name_key, locale) : cstate.id,
        share: cstate.marketShare,
        color: definition?.color ?? "#547ad8",
      };
    })
    .sort((a, b) => b.share - a.share);

  const seasonBrief = getCompetitionSeasonBrief(gameState);
  const topPressureId = seasonBrief.topPressure?.competitorId;
  const competitorTotal = competitorShares.reduce((sum, c) => sum + c.share, 0);
  const otherShare = Math.max(0, 100 - playerShare - competitorTotal);

  // v0.58 #2 — 최근 24개월 sliding window의 우리/최상위 라이벌 점유율 sparkline. 2개월 미만은 추세선 의미가 없어 렌더 생략.
  const history = gameState.marketShareHistory ?? [];
  const SPARKLINE_W = 240;
  const SPARKLINE_H = 40;
  const SPARKLINE_PAD_X = 2;
  const SPARKLINE_PAD_Y = 4;
  const sparklineInnerW = SPARKLINE_W - SPARKLINE_PAD_X * 2;
  const sparklineInnerH = SPARKLINE_H - SPARKLINE_PAD_Y * 2;
  const sparklineMax = Math.max(
    50,
    ...history.map((entry) => Math.max(entry.player, entry.topRivalShare)),
  );
  const sparklineX = (i: number) =>
    SPARKLINE_PAD_X + (history.length <= 1 ? sparklineInnerW / 2 : (i / (history.length - 1)) * sparklineInnerW);
  const sparklineY = (value: number) =>
    SPARKLINE_PAD_Y + sparklineInnerH - (value / sparklineMax) * sparklineInnerH;
  const playerPoints = history.map((entry, i) => `${sparklineX(i)},${sparklineY(entry.player)}`).join(" ");
  const rivalPoints = history.map((entry, i) => `${sparklineX(i)},${sparklineY(entry.topRivalShare)}`).join(" ");
  const hasTrend = history.length >= 2;

  return (
    <section className="market-share-panel" aria-label="시장 점유율">
      <header className="market-share-header">
        <strong>시장 점유율</strong>
        <span className="market-share-self-pill">우리 {playerShare}%</span>
        {seasonBrief.topPressure && (
          <span className="market-share-pressure-pill">
            최대 압박 {seasonBrief.topPressure.competitorName} {seasonBrief.topPressure.marketShare}%
          </span>
        )}
      </header>
      <div
        className="market-share-bar"
        role="img"
        aria-label={`시장 점유율 분포 우리 ${playerShare}% 외 ${competitorShares.length}개 경쟁사`}
      >
        <div
          className="market-share-segment market-share-self"
          style={{ width: `${playerShare}%` } as CSSProperties}
          title={`우리 ${playerShare}%`}
        />
        {competitorShares.map((entry) => (
          <div
            key={entry.id}
            className={`market-share-segment${entry.id === topPressureId ? " market-share-top" : ""}`}
            style={{ width: `${entry.share}%`, background: entry.color } as CSSProperties}
            title={`${entry.name} ${entry.share}%`}
          />
        ))}
        {otherShare > 0 && (
          <div
            className="market-share-segment market-share-other"
            style={{ width: `${otherShare}%` } as CSSProperties}
            title={`기타 ${otherShare}%`}
          />
        )}
      </div>
      {hasTrend && (
        <div className="market-share-trend">
          <span className="market-share-trend-label">최근 {history.length}개월 추세 (우리 · 최상위 라이벌)</span>
          <svg
            className="market-share-sparkline"
            viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`최근 ${history.length}개월 시장 점유율 추세`}
          >
            <polyline
              className="market-share-sparkline-rival"
              points={rivalPoints}
              fill="none"
            />
            <polyline
              className="market-share-sparkline-player"
              points={playerPoints}
              fill="none"
            />
          </svg>
        </div>
      )}
      <ol className="market-share-legend">
        <li className="market-share-legend-self">
          <i className="market-share-swatch market-share-swatch-self" aria-hidden="true" />
          <span>우리</span>
          <strong>{playerShare}%</strong>
        </li>
        {competitorShares.slice(0, 5).map((entry) => (
          <li
            key={entry.id}
            className={entry.id === topPressureId ? "market-share-legend-top" : ""}
          >
            <i
              className="market-share-swatch"
              style={{ background: entry.color } as CSSProperties}
              aria-hidden="true"
            />
            <span>{entry.name}</span>
            <strong>{entry.share}%</strong>
            {entry.id === topPressureId && <em className="market-share-pressure-badge">압박</em>}
          </li>
        ))}
      </ol>
    </section>
  );
}
