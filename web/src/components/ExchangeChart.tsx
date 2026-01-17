import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type CandlestickData,
  type HistogramData,
  type UTCTimestamp,
} from "lightweight-charts";

const PAIRS = [
  { k: "SOL_USDC", label: "SOL/USDC", ws: "SOL/USDC", rest: "SOLUSDC" },
  { k: "ETH_USDC", label: "ETH/USDC", ws: "ETH/USDC", rest: "ETHUSDC" },
  { k: "BTC_USDC", label: "BTC/USDC", ws: "BTC/USDC", rest: "BTCUSDC" },
  //failed { value: "HYPE_USDC", label: "HYPE/USDC", wsPair: "HYPE/USDC", restPair: "HYPEUSDC" },
] as const;

const TFS = ["1H", "1D", "1W", "1M", "6M", "1Y", "ALL"] as const;
type TF = (typeof TFS)[number];
type PairKey = (typeof PAIRS)[number]["k"];
type ChartType = "candles" | "line";

const TF_SEC: Record<TF, number | null> = {
  "1H": 3600,
  "1D": 86400,
  "1W": 7 * 86400,
  "1M": 30 * 86400,
  "6M": 180 * 86400,
  "1Y": 365 * 86400,
  ALL: null,
};

type OHLC = [string | number, string | number, string | number, string | number, string | number];
type History = { line: AreaData<UTCTimestamp>[]; candles: CandlestickData<UTCTimestamp>[] };
type WSStatus = "connecting" | "live" | "disconnected";

const MAX_POINTS = 800;

async function ohlc(restPair: string, tf: TF): Promise<OHLC[]> {
  const now = Math.floor(Date.now() / 1000);
  const cfg: Record<TF, { interval: number; since: number | null }> = {
    "1H": { interval: 1, since: now - 2 * 3600 },
    "1D": { interval: 5, since: now - 3 * 86400 },
    "1W": { interval: 60, since: now - 14 * 86400 },
    "1M": { interval: 240, since: now - 60 * 86400 },
    "6M": { interval: 1440, since: now - 2 * 365 * 86400 },
    "1Y": { interval: 1440, since: now - 2 * 365 * 86400 },
    ALL: { interval: 1440, since: now - 2 * 365 * 86400 },
  };

  const { interval, since } = cfg[tf];
  let url = `https://api.kraken.com/0/public/OHLC?pair=${encodeURIComponent(restPair)}&interval=${interval}`;
  if (since) url += `&since=${since}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as { error?: string[]; result?: Record<string, unknown> };
  if (j.error?.length) throw new Error(j.error.join(", "));

  const result = j.result ?? {};
  const arr =
    (result[restPair] as unknown) ??
    Object.values(result).find((v) => Array.isArray(v));
  return (arr as OHLC[]) ?? [];
}

function toHistory(rows: OHLC[]): History {
  const line: History["line"] = [];
  const candles: History["candles"] = [];
  for (const r of rows) {
    const t = Number(r[0]) as UTCTimestamp;
    const o = Number(r[1]), h = Number(r[2]), l = Number(r[3]), c = Number(r[4]);
    if (![o, h, l, c].every((x) => Number.isFinite(x) && x > 0)) continue;
    line.push({ time: t, value: c });
    candles.push({ time: t, open: o, high: h, low: l, close: c });
  }
  return { line, candles };
}

type Props = {
  compact?: boolean;
  className?: string;
  mode?: "rate" | "position";
  positionAmount?: number;
  positionLabel?: string;
  onInitialValue?: (v: number) => void;
  startTimestamp?: number;
};

export default function ExchangeChart({
  compact = false,
  className,
  mode = "rate",
  positionAmount = 1,
  positionLabel,
  onInitialValue,
  startTimestamp,
}: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceRef = useRef<ISeriesApi<typeof AreaSeries> | ISeriesApi<typeof CandlestickSeries> | null>(null);
  const volRef = useRef<ISeriesApi<typeof HistogramSeries> | null>(null);

  const [pairKey, setPairKey] = useState<PairKey>("SOL_USDC");
  const [tf, setTf] = useState<TF>("1W");
  const [type, setType] = useState<ChartType>("candles");
  const [hist, setHist] = useState<History>({ line: [], candles: [] });
  const [live, setLive] = useState<number | null>(null);
  const [ws, setWs] = useState<WSStatus>("connecting");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pair = useMemo(() => PAIRS.find((p) => p.k === pairKey)!, [pairKey]);
  const isPos = mode === "position";

  const data = useMemo<History>(() => {
    const sec = TF_SEC[tf];
    const now = Math.floor(Date.now() / 1000);
    let min: number | null = null;

    if (!isPos) {
      min = sec ? now - sec : null;
    } else {
      min = startTimestamp ?? null;
      if (sec) min = min != null ? Math.max(min, now - sec) : now - sec;
    }

    const base =
      min == null
        ? hist
        : {
          line: hist.line.filter((p) => p.time >= (min as UTCTimestamp)),
          candles: hist.candles.filter((c) => c.time >= (min as UTCTimestamp)),
        };

    if (!isPos) return base;

    const m = positionAmount || 0;
    return {
      line: base.line.map((p) => ({ ...p, value: p.value * m })),
      candles: base.candles.map((c) => ({
        ...c,
        open: c.open * m,
        high: c.high * m,
        low: c.low * m,
        close: c.close * m,
      })),
    };
  }, [hist, tf, isPos, positionAmount, startTimestamp]);

  const display = useMemo(() => {
    const v = live ?? (type === "line" ? data.line.at(-1)?.value : data.candles.at(-1)?.close) ?? null;
    return v == null ? null : isPos ? v * positionAmount : v;
  }, [live, data, type, isPos, positionAmount]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || chartRef.current) return;

    const chart = createChart(el, {
      layout: {
        background: { type: "solid", color: "#06131c" },
        textColor: "rgba(226,232,240,0.88)",
        fontFamily: "Inter, ui-sans-serif, system-ui",
        fontSize: 12,
        attributionLogo: false,
      },
      grid: {
        horzLines: { color: "rgba(148,163,184,0.10)" },
        vertLines: { color: "rgba(148,163,184,0.07)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(45,212,191,0.35)", width: 1, labelBackgroundColor: "#0ea5a5" },
        horzLine: { color: "rgba(45,212,191,0.28)", width: 1, labelBackgroundColor: "#0ea5a5" },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: "rgba(226,232,240,0.75)",
        scaleMargins: { top: 0.10, bottom: 0.25 },
      },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      width: el.clientWidth || 800,
      height: compact ? 300 : 420,
      localization: { priceFormatter: (p: number) => p.toFixed(4) },
    });

    chartRef.current = chart;
    const ro = new ResizeObserver((es) => {
      const w = es[0]?.contentRect.width;
      if (w) chart.applyOptions({ width: w });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      try { chart.remove(); } catch { }
      chartRef.current = null;
      priceRef.current = null;
      volRef.current = null;
    };
  }, [compact]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const rows = await ohlc(pair.rest, tf);
        if (!alive) return;
        const h = toHistory(rows);
        setHist(h);
        const last = h.line.at(-1)?.value ?? null;
        if (last != null) setLive(last);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "Unable to fetch rates");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [pair.rest, tf]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const priceData = type === "line" ? data.line : data.candles;
    if (!priceData.length) return;

    if (priceRef.current) { try { chart.removeSeries(priceRef.current as any); } catch { } }
    if (volRef.current) { try { chart.removeSeries(volRef.current as any); } catch { } }
    priceRef.current = null;
    volRef.current = null;

    const p =
      type === "line"
        ? chart.addSeries(AreaSeries, {
          topColor: "rgba(45,212,191,0.25)",
          bottomColor: "rgba(45,212,191,0.02)",
          lineColor: "rgba(45,212,191,0.90)",
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
          priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
        })
        : chart.addSeries(CandlestickSeries, {
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderUpColor: "#22c55e",
          borderDownColor: "#ef4444",
          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false,
          priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
        });

    if (type === "line") (p as ISeriesApi<typeof AreaSeries>).setData(priceData as AreaData<UTCTimestamp>[]);
    else (p as ISeriesApi<typeof CandlestickSeries>).setData(priceData as CandlestickData<UTCTimestamp>[]);

    const v = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    v.priceScale().applyOptions({ scaleMargins: { top: 0.80, bottom: 0.00 } });

    const vols: HistogramData<UTCTimestamp>[] = data.candles.map((c) => ({
      time: c.time,
      value: Math.max(0, (c.high - c.low) * 100000),
      color: c.close >= c.open ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
    }));

    v.setData(vols);

    priceRef.current = p as any;
    volRef.current = v;

    chart.timeScale().fitContent();

    if (mode === "position" && onInitialValue) {
      const first = type === "line" ? (priceData as any)[0]?.value : (priceData as any)[0]?.open;
      if (first != null && Number.isFinite(first)) onInitialValue(first);
    }
  }, [data, type, mode, onInitialValue]);

  useEffect(() => {
    let w: WebSocket | null = null;
    let t: number | null = null;
    let alive = true;

    const connect = () => {
      if (!alive) return;
      setWs("connecting");
      w = new WebSocket("wss://ws.kraken.com");

      w.onopen = () => {
        if (!alive || !w) return;
        setWs("live");
        w.send(JSON.stringify({ event: "subscribe", pair: [pair.ws], subscription: { name: "ticker" } }));
      };

      w.onmessage = (ev) => {
        if (!alive) return;
        let m: any;
        try { m = JSON.parse(ev.data); } catch { return; }
        if (!Array.isArray(m)) return;
        const [, payload, , pairLabel] = m;
        if (pairLabel !== pair.ws) return;
        const last = parseFloat(payload?.c?.[0]);
        if (!Number.isFinite(last) || last <= 0) return;

        setLive(last);
        setHist((prev) => {
          const now = Math.floor(Date.now() / 1000) as UTCTimestamp;

          const line = [...prev.line, { time: now, value: last }].slice(-MAX_POINTS);

          const candles = [...prev.candles];
          const lc = candles[candles.length - 1];
          if (lc && Math.abs(Number(now) - Number(lc.time)) < 60) {
            candles[candles.length - 1] = {
              ...lc,
              high: Math.max(lc.high, last),
              low: Math.min(lc.low, last),
              close: last,
            };
          } else {
            candles.push({ time: now, open: last, high: last, low: last, close: last });
            if (candles.length > MAX_POINTS) candles.shift();
          }

          return { line, candles };
        });
      };

      w.onclose = () => {
        if (!alive) return;
        setWs("disconnected");
        t = window.setTimeout(connect, 3000);
      };

      w.onerror = () => {
        if (!alive) return;
        setWs("disconnected");
      };
    };

    connect();

    return () => {
      alive = false;
      if (t != null) window.clearTimeout(t);
      if (w) {
        try {
          w.onopen = null;
          w.onmessage = null;
          w.onclose = null;
          w.onerror = null;
          if (w.readyState === WebSocket.OPEN) w.close();
        } catch { }
      }
    };
  }, [pair.ws]);

  return (
    <div
      className={className}
      style={{
        background: "#06131c",
        border: "1px solid rgba(148,163,184,0.12)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 16px",
          borderBottom: "1px solid rgba(148,163,184,0.10)",
          background: "linear-gradient(180deg, rgba(6,19,28,1), rgba(6,19,28,0.96))",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "rgba(226,232,240,0.65)" }}>
            {mode === "position" ? "Live position value" : "Live Rate"}
          </div>
          <div style={{ marginTop: 2, fontSize: 18, fontWeight: 700, color: "rgba(226,232,240,0.92)" }}>
            {mode === "position" ? positionLabel || "Position value" : pair.label}
          </div>
          {display != null && (
            <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>
              {display.toFixed(4)}{" "}
              <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
                {ws === "live" ? "Live" : ws === "connecting" ? "Connecting…" : "Reconnecting…"}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={pillWrap}>
            {PAIRS.map((p) => (
              <button key={p.k} onClick={() => setPairKey(p.k)} style={pill(p.k === pairKey)}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={pillWrap}>
            {TFS.map((x) => (
              <button key={x} onClick={() => setTf(x)} style={pill(x === tf)}>
                {x}
              </button>
            ))}
          </div>

          <div style={pillWrap}>
            <button onClick={() => setType("candles")} style={pill(type === "candles")}>
              Candles
            </button>
            <button onClick={() => setType("line")} style={pill(type === "line")}>
              Line
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 10px 12px" }}>
        {loading && <div style={{ margin: "8px 6px", color: "rgba(226,232,240,0.70)", fontSize: 12 }}>Loading…</div>}
        {err && <div style={{ margin: "8px 6px", color: "#ef4444", fontSize: 12 }}>{err}</div>}
        <div ref={boxRef} style={{ height: compact ? 300 : 420 }} />
      </div>
    </div>
  );
}

const pillWrap: React.CSSProperties = {
  display: "flex",
  gap: 6,
  background: "rgba(15,23,42,0.45)",
  border: "1px solid rgba(148,163,184,0.12)",
  padding: 6,
  borderRadius: 12,
};

const pill = (active: boolean): React.CSSProperties => ({
  border: 0,
  background: active ? "rgba(45,212,191,0.18)" : "transparent",
  color: active ? "rgba(226,232,240,0.95)" : "rgba(226,232,240,0.75)",
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 10,
  cursor: "pointer",
  boxShadow: active ? "0 0 0 1px rgba(45,212,191,0.25) inset" : "none",
});
