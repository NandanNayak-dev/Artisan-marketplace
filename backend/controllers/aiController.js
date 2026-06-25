const getPopularHandicraftsByLocation = async (req, res) => {
  try {
    const { location } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!location) {
      return res.status(400).json({
        message: "Location is required",
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is not configured",
      });
    }

    const prompt = `
List popular handicraft items from ${location}.

Rules:
- Return only 5 to 7 items.
- Each item must be one line only.
- Format each line exactly like: Item name - one short info line.
- Do not write an introduction.
- Do not write a conclusion.
- Do not include long descriptions.
- Keep each info line under 12 words.
`;

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
          input: prompt,
          generation_config: {
            temperature: 0.4,
          },
        }),
      },
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        message: "Gemini failed to generate suggestions",
        error: data.error?.message || "Unknown Gemini API error",
      });
    }

    const suggestion = data.output_text?.trim();

    if (!suggestion) {
      return res.status(500).json({
        message: "Gemini returned an empty response",
      });
    }

    return res.status(200).json({
      location,
      suggestion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate suggestions",
      error: error.message,
    });
  }
};

module.exports = {
  getPopularHandicraftsByLocation,
};
