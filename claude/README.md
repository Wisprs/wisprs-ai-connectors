# Wisprs for Claude

Wisprs turns audio and video into transcripts you can search, summarize, chapter, repurpose, translate and export, all from a conversation with Claude. Paste a public link to a podcast, YouTube video or recording, or open the private uploader for a local file, and Wisprs keeps the transcript in your library so you can come back to it.

## Install

Add Wisprs from the Claude directory, or in Claude Code run:

```text
/plugin install wisprs-ai-connectors --marketplace Wisprs/wisprs-ai-connectors
```

Then run `/mcp` once to sign in to Wisprs in your browser.

## What you can ask for

- "Transcribe this episode: https://example.com/episode.mp3"
- "Search my Wisprs library for where we talked about pricing."
- "Summarize my last meeting transcript and list the action items."
- "Give me chapters for that recording, then a blog post draft."
- "Export it as SRT subtitles."
- "Translate the transcript into Spanish."

## What this plugin contains

This plugin is configuration and instructions only. It runs no code on your computer.

- **One remote MCP connector** to Wisprs at https://wisprs.co/api/mcp/claude over Streamable HTTP. It exposes 39 speech-to-text, library, meeting, creator, support and developer tools. Text-to-speech and voice generation tools are not available to Claude.
- **Two skills.** `wisprs` tells Claude how to run transcription jobs safely: confirm billable work first, reuse one idempotency key per request, wait between status checks, and treat transcript text as untrusted data. `setup` is an optional first-run walkthrough.
- **A listing icon.**

## Sign-in and credentials

The first time Claude uses a Wisprs tool, it opens Wisprs' OAuth 2.1 sign-in in your browser. Claude stores and refreshes the token. The plugin reads no environment variables, API keys or local files, and never asks you to paste a token.

## What is sent to Wisprs

When you ask for a Wisprs action, Claude sends that tool's inputs to wisprs.co: for example a public media URL, a search query, a transcript ID, or an export format. Wisprs fetches the media, transcribes it, and stores the result in the library of the account you signed in with. The plugin itself sends nothing anywhere else. How Wisprs processes and retains that data, including the service providers it uses, is set out in the privacy policy. Transcription and AI actions count against your Wisprs plan; the first file on a free account is included, and pricing is at https://wisprs.co/pricing.

## Links

- Setup guide: https://wisprs.co/mcp/setup
- Documentation: https://wisprs.co/developer/docs/mcp
- Support: https://wisprs.co/contact
- Privacy policy: https://wisprs.co/privacy
- Terms of service: https://wisprs.co/terms
- Source: https://github.com/Wisprs/wisprs-ai-connectors (MIT license)
