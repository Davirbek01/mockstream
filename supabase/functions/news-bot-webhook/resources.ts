// Useful sources — web-grounded resource search + Gemini-illustrated image option.

export const RES_SKILLS: Record<string, { label: string; emoji: string }> = {
  listening: { label: 'Listening', emoji: '🎧' },
  reading:   { label: 'Reading',   emoji: '📖' },
  writing:   { label: 'Writing',   emoji: '✍️' },
  speaking:  { label: 'Speaking',  emoji: '🗣' },
};

export function resourcesMenu() {
  return {
    text:
      '🌐 Useful sources\n\n' +
      'Pick a skill — Gemini will search the web for a valuable resource (website / app / shadowing tool / etc) and explain it in Uzbek.',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎧 Listening', callback_data: 'm:resmode:listening' }],
        [{ text: '📖 Reading',   callback_data: 'm:resmode:reading' }],
        [{ text: '✍️ Writing',   callback_data: 'm:resmode:writing' }],
        [{ text: '🗣 Speaking',  callback_data: 'm:resmode:speaking' }],
        [{ text: '« Back',       callback_data: 'm:main' }],
      ],
    },
  };
}

export function resourceModeMenu(skill: string) {
  const info = RES_SKILLS[skill];
  return {
    text:
      `${info.emoji} ${info.label} resource\n\n` +
      `Include a Gemini-generated illustration?\n` +
      `• "With image" attaches a picture (≈10s extra) and the resource opens via a button.\n` +
      `• "Text only" is faster — just the link + Uzbek description.`,
    reply_markup: {
      inline_keyboard: [
        [{ text: '🖼 With image', callback_data: `m:res:${skill}:image` }],
        [{ text: '📝 Text only',  callback_data: `m:res:${skill}:text` }],
        [{ text: '« Back',        callback_data: 'm:resources' }],
      ],
    },
  };
}

export async function fetchResource(skill: string, apiKey: string) {
  const skillLabel = RES_SKILLS[skill]?.label || skill;
  const prompt =
    `Search the web for ONE valuable, currently-active online resource specifically for practicing English ${skillLabel.toLowerCase()}.\n` +
    `Pick something teachers would actually recommend — a website, mobile app, shadowing tool, language exchange platform, etc.\n` +
    `Don't default to generic tools like Duolingo unless they are particularly strong for ${skillLabel.toLowerCase()}.\n\n` +
    `Respond ONLY with this JSON shape inside a fenced code block:\n` +
    '```json\n' +
    `{\n` +
    `  "name": "Resource name",\n` +
    `  "url": "https://...",\n` +
    `  "description_uz": "Brief Uzbek explanation in Latin script (~80-150 words) explaining what the resource is and how it helps with ${skillLabel.toLowerCase()}. Use natural, friendly conversational Uzbek that an Uzbek-speaking English learner will understand. Keep English keywords (like 'shadowing', 'podcast') as-is."\n` +
    `}\n` +
    '```\n';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.95, maxOutputTokens: 4000 },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini error ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text).filter(Boolean).join('\n');
  if (!text) throw new Error('Empty Gemini response');
  const fenceMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const jsonText = fenceMatch ? fenceMatch[1] : (text.match(/\{[\s\S]*\}/) || [null])[0];
  if (!jsonText) throw new Error('No JSON in response');
  return JSON.parse(jsonText) as { name: string; url: string; description_uz: string };
}

export async function saveResourceState(supabase: any, chatId: number, messageId: number, name: string, url: string) {
  await supabase.from('channel_bot_resource_state').upsert({
    chat_id: chatId,
    message_id: messageId,
    resource_name: name,
    resource_url: url,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'chat_id' });
}

export async function getResourceState(supabase: any, chatId: number) {
  const { data } = await supabase.from('channel_bot_resource_state').select('*').eq('chat_id', chatId).maybeSingle();
  return data || null;
}

export async function clearResourceState(supabase: any, chatId: number) {
  await supabase.from('channel_bot_resource_state').delete().eq('chat_id', chatId);
}

export async function genResourceImage(supabase: any, apiKey: string, resourceName: string, skill: string): Promise<string> {
  const skillLabel = RES_SKILLS[skill]?.label || skill;
  const prompt =
    `Modern flat illustration in friendly cartoon style. ` +
    `Show an English language learner happily using "${resourceName}" for ${skillLabel.toLowerCase()} practice. ` +
    `Bright, clean colours, simple background, NO text, NO letters, NO watermarks, family-friendly.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  if (!resp.ok) throw new Error(`Image gen ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      const bin = atob(p.inlineData.data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const filename = `resource_${skill}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
      const { data: upData, error: upErr } = await supabase.storage.from('channel-post-images').upload(filename, bytes, { contentType: 'image/png', upsert: false });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('channel-post-images').getPublicUrl(upData.path);
      return pubData.publicUrl;
    }
  }
  throw new Error('No image data returned');
}
