export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors });

    // Health
    if (url.pathname === "/health")
      return Response.json({ status: "ok", worker: "terabox-proxy" }, { headers: cors });

    const surl = url.searchParams.get("url");
    const mode = url.searchParams.get("mode") || "resolve";
    if (!surl)
      return Response.json({ error: "missing url" }, { status: 400, headers: cors });

    // Ambil share ID dari URL
    const m = surl.match(/s\/([A-Za-z0-9_-]+)/);
    if (!m)
      return Response.json({ error: "invalid share URL" }, { status: 400, headers: cors });

    const shareid = m[1];

    // Forward cookie dari request gateway → diteruskan ke TeraBox
    const cookie = request.headers.get("Cookie") || "";

    const apiUrl = `https://dm.terabox.com/api/2/getShareBaseInfo?shorturl=1&root=1&shorturl=${shareid}`;

    const resp = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Cookie: cookie,
        Referer: "https://dm.terabox.com/",
      },
    });

    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: {
        ...cors,
        "Content-Type": resp.headers.get("Content-Type") || "application/json",
      },
    });
  },
};