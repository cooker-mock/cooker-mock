/**
 * OpenAI service
 * 
 * @file services/openAi.js
 * @module services/openAi
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const OpenAI = require('openai');
const { IO } = require('../io');

/**
 * AI help fill fields in a scene for a mock API
 * 
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
      You need to fill the field with the correct value and value type based on the field name.
      Don't overwrite the field value if it's not empty, only fill the empty fields (e.g. "", null, undefined, etc.), and don't change the field name.
      For example, if the field name is "name", and the field value is "", you need to fill the field with the name of the person.
      If the field name is "success", and the field value is "", you need to fill the field with true or false.
      If the field type is "array", you need to add more similar data to the array based on the existing array items pattern.
      Also, if the JSON data is not valid, you need to fix the JSON data and return the valid JSON data.
      But you should pay attention to the commented text (with //) in the JSON data, these are the specific instructions for you.
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
