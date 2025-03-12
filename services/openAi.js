const OpenAI = require('openai');
const { IO } = require('../io');

/**
 * AI Filling a scene for a mock API
 * @param {string} sceneResponse
 * @returns {string}
 */
const aiFilling = async (sceneResponse) => {
  const io = new IO();
  const openai = new OpenAI({
    apiKey: io.getOpenAIAPIKey(),
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `
      You are a helpful assistant.
      You are given a mock API response JSON data.
      You need to fill the empty fields in the response data based on the field name.
      For example, if the field name is "name", and the field value is "", you need to fill the field with the name of the person.
      For example, if the field name is "success", and the field value is "", you need to fill the field with true or false.
      So, you need to fill the field with the correct value and value type based on the field name.
      Also, if the JSON data is not valid, you need to fix the JSON data and return the valid JSON data.
      Just return the JSON data, do not include any other text.
      Mock API response JSON data: ${sceneResponse}
      `,
      },
    ],
  });
  return response.choices[0].message.content;
};

module.exports = {
  aiFilling,
};
