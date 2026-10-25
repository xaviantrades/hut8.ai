    // Add or remove entries to change the ticker list.
    // "symbol" must be a valid Binance USDT trading pair.
    const COINS = [
      { symbol: "btcusdt", label: "BTC", name: "Bitcoin" },
      { symbol: "ethusdt", label: "ETH", name: "Ethereum" },
      { symbol: "bnbusdt", label: "BNB", name: "BNB" },
      { symbol: "solusdt", label: "SOL", name: "Solana" },
      { symbol: "xrpusdt", label: "XRP", name: "XRP" },
      { symbol: "dogeusdt", label: "DOGE", name: "Dogecoin" }
    ];

    const grid = document.getElementById("grid");
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    const lastUpdated = document.getElementById("last-updated");
    const lastPrices = {};





    COINS.forEach((coin) => {
      const card = document.createElement("article");
      card.className = "coin-card";
      card.id = `card-${coin.symbol}`;

      const pair = coin.symbol.toUpperCase().replace("USDT", "_USDT");
      

      card.innerHTML = `
        <div class="coin-top">
          <div class="coin-identity">
            <span class="coin-icon" aria-hidden="true">${coin.label.slice(0, 2)}</span>
            <div>
              <span class="coin-symbol">${coin.label}</span>
              <span class="coin-name">${coin.name}</span>
            </div>
          </div>
          <span class="coin-pair">${coin.label}/USDT</span>
        </div>

        <span class="price-label">Last price</span>
        <div class="price-row">
          <div class="coin-price" id="price-${coin.symbol}">--</div>
          <span class="coin-change" id="change-${coin.symbol}">24h --</span>
        </div>

        <div class="coin-stats">
          <div class="stat">
            <span class="stat-label">24h High</span>
            <span class="stat-value" id="high-${coin.symbol}">--</span>
          </div>
          <div class="stat">
            <span class="stat-label">24h Low</span>
            <span class="stat-value" id="low-${coin.symbol}">--</span>
          </div>
          <div class="stat wide">
            <span class="stat-label">24h Volume</span>
            <span class="stat-value" id="volume-${coin.symbol}">--</span>
          </div>
        </div>

        <a class="buy-button" data-symbol="${coin.symbol}">
    Buy ${coin.label}
    <span class="button-arrow" aria-hidden="true">→</span>
</a>
      `;

      grid.appendChild(card);
    });

document.addEventListener("click", function (event) {

    const buyButton = event.target.closest(".buy-button");

    if (!buyButton) return;

    const symbol = buyButton.dataset.symbol;

    const coin = COINS.find(
        c => c.symbol === symbol
    );

    if (!coin) {
        console.error("Coin not found:", symbol);
        return;
    }

    // Popup elements
    const coinname =
        document.getElementById("selectedBtc");

    const coinnamee =
        document.getElementById("selectedtc");

    
    // Set popup information
    if (coinname) {
        coinname.textContent = coin.label;
    }

    if (coinnamee) {
        coinnamee.textContent = coin.name;
    }

    
    // Show popup
    const popup =
        document.getElementById("buyPopup");

    if (popup) {
        popup.classList.add("show");
    }

});




    function formatPrice(value) {
      const num = Number(value);
      if (!Number.isFinite(num)) return "--";

      if (num >= 1) {
        return num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }

      return num.toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6
      });
    }

    function formatVolume(value) {
      const num = Number(value);
      if (!Number.isFinite(num)) return "--";

      return new Intl.NumberFormat(undefined, {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 2
      }).format(num);
    }

    let ws;
    let reconnectTimer;
    let reconnectAttempts = 0;

    function setStatus(message, isLive = false) {
      statusText.textContent = message;
      statusDot.classList.toggle("live", isLive);
    }

    function connect() {
      clearTimeout(reconnectTimer);
      setStatus(reconnectAttempts ? "Reconnecting to market..." : "Connecting to market...");

      const streams = COINS.map((coin) => `${coin.symbol}@ticker`).join("/");
      ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.onopen = () => {
        reconnectAttempts = 0;
        setStatus("Market live", true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const data = payload.data;
          if (!data) return;

          const symbol = data.s.toLowerCase();
          const price = Number(data.c);
          const changePercent = Number(data.P);
          const priceEl = document.getElementById(`price-${symbol}`);
          const changeEl = document.getElementById(`change-${symbol}`);
          const highEl = document.getElementById(`high-${symbol}`);
          const lowEl = document.getElementById(`low-${symbol}`);
          const volumeEl = document.getElementById(`volume-${symbol}`);

          if (!priceEl) return;

          const previousPrice = lastPrices[symbol];
          priceEl.textContent = "$" + formatPrice(price);
          priceEl.classList.remove("up", "down");

          if (previousPrice !== undefined) {
            if (price > previousPrice) priceEl.classList.add("up");
            if (price < previousPrice) priceEl.classList.add("down");
          }

          lastPrices[symbol] = price;

          const isUp = changePercent >= 0;
          changeEl.textContent = `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`;
          changeEl.classList.remove("up", "down");
          changeEl.classList.add(isUp ? "up" : "down");

          highEl.textContent = "$" + formatPrice(data.h);
          lowEl.textContent = "$" + formatPrice(data.l);
          volumeEl.textContent = `${formatVolume(data.q)} USDT`;
          lastUpdated.textContent = `Last update: ${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })}`;
        } catch (error) {
          console.error("Could not read market update:", error);
        }
      };

      ws.onclose = () => {
        setStatus("Market feed disconnected");
        reconnectAttempts += 1;
        const delay = Math.min(3000 * reconnectAttempts, 15000);
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();