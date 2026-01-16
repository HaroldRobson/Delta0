import requests

def list_perp_market_ids():
    url = "https://api.hyperliquid.xyz/info"
    payload = {"type": "meta"}

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()

        print(f"{'Asset Symbol':<12} | {'Index (Decimal)':<15}")
        print("-" * 60)

        for i, asset in enumerate(data["universe"]):
            symbol = asset["name"]
            
            hex_id = f"0x{i:016x}"

            print(f"{symbol:<12} | {i:<15}")

    except Exception as e:
        if "429" in str(e):
            print("Error: You are being rate limited. Wait 60 seconds.")
        else:
            print(f"Error fetching metadata: {e}")

if __name__ == "__main__":
    list_perp_market_ids()
