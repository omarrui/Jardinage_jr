async function postJson(url, payload) {
  if (!url) return { ok: false };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return { ok: response.ok };
  } catch (error) {
    console.error("Internal HTTP request failed:", error.message);
    return { ok: false };
  }
}

module.exports = { postJson };
