const getPopularHandicraftsByLocation = async (req, res) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({
        message: "Location is required",
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

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt,
        stream: false,
      }),
    });

    const data = await ollamaRes.json();

    return res.status(200).json({
      location,
      suggestion: data.response,
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
