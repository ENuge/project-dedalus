// @flow
// appType is used to determine which react to hydrate with client-side.
// the dedalus stuff should all be removed and just use the same assets...
// buuut I'm not quite there yet. Shrug.
const htmlTemplate = (reactDom: string, appType: string) => `
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Dedalus</title>
          <link rel="shortcut icon" type="image/ico" href="public/favicon.ico"/>
          <link href="https://fonts.googleapis.com/css?family=Fira+Sans:100,300,400" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css?family=Didact+Gothic" rel="stylesheet">
          <!-- The link below is to source-serif-pro: light+regular and bold/italics. -->
          <link rel="stylesheet" href="https://use.typekit.net/wih6fdh.css">
          <link rel="stylesheet" type="text/css" href="public/index.css"/>
        </head>
      
      <body>
        <div id="app-${appType}">${reactDom}</div>
        <script src="public/bundle.js"></script>
      </body>
    </html>
  `;
export default htmlTemplate;
