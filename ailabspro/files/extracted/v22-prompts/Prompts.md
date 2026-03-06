Build a minimal TypeScript ChatGPT App: use @modelcontextprotocol/sdk with Express to
expose a findPlaces tool that hits Google Places API (New) nearby search endpoint, that,
on load, calls window.openai.callTool('findPlaces', { query: 'restaurants', radius:
1000 }), and renders responsive place cards with photos, ratings, and details inline in
the widget.

Have it run through a local server and ngrok.

Please read through all the documentation here:
https://developers.openai.com/apps-sdk/build/mcp-server

Google Places API Documentation:
https://developers.google.com/maps/documentation/places/web-service/nearby-search

Setup: Get API key from https://console.cloud.google.com/, enable "Places API (New)".
Store in .env as GOOGLE_PLACES_API_KEY. 

Build a minimal TypeScript ChatGPT App: Clone and use the existing TMDB MCP server from
https://github.com/rakeshgangwar/tmdb-mcp-server, then use @modelcontextprotocol/sdk
with Express to create a wrapper that connects to the existing MCP server's
search_movies tool and adds widget support, that, on load, calls
window.openai.callTool('search_movies', { query: 'popular' }), and renders responsive
movie cards with posters, ratings, and descriptions inline in the widget.

Have the existing TMDB MCP server run on one terminal, your wrapper server on another
(port 3000), and expose via ngrok.

Existing MCP Server: https://github.com/rakeshgangwar/tmdb-mcp-serverTMDB API
Documentation: https://developer.themoviedb.org/docs/image-basics

Setup: Get TMDB API key from https://www.themoviedb.org/settings/api. Clone MCP server,
run npm install && npm run build, add TMDB_API_KEY to .env. Image URL format:
[https://image.tmdb.org/t/p/w500${poster_path}](https://image.tmdb.org/t/p/w500$%7Bposter_path%7D). 

Build a minimal TypeScript ChatGPT App: use @modelcontextprotocol/sdk with Express to
expose a [TOOL_NAME] tool that hits [API_NAME]'s [ENDPOINT_NAME] endpoint, that, on
load, calls window.openai.callTool('[TOOL_NAME]', { [PARAMETERS] }), and renders
responsive [WIDGET_TYPE] for the results inline in the widget.

Have it run through a local server and ngrok.

Please read through all the documentation here:
https://developers.openai.com/apps-sdk/build/mcp-server

[API_NAME] Documentation: [DOCUMENTATION_URL]

Setup: Get API key from [API_PROVIDER_URL], enable "[API_SERVICE_NAME]". Store in .env
as [ENV_VARIABLE_NAME].