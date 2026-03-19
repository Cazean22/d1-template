export function renderHtml(content: string) {
	return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>D1</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>
    
		  <body>
			<header>
          <img
            src="https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/30e0d3f6-6076-40f8-7abb-8a7676f83c00/public"
          />
			  <h1>🎉 Successfully connected token storage to D1</h1>
			</header>
			<main>
			  <p>Your D1 Database contains the following account rows:</p>
			  <pre><code><span style="color: #0E838F">&gt; </span>SELECT * FROM accounts LIMIT 3;<br>${content}</code></pre>
			  <small class="blue">
				<a target="_blank" href="https://developers.cloudflare.com/d1/">Explore Cloudflare D1 documentation</a>
			  </small>
			</main>
      </body>
    </html>
`;
}
