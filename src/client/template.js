// @flow
const htmlTemplate = (reactDom: string) => `
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Dedalus</title>
          <link rel="shortcut icon" type="image/ico" href="public/favicon.ico"/>
          <link href="https://fonts.googleapis.com/css?family=Fira+Sans:100,300,400" rel="stylesheet">
          <link rel="stylesheet" type="text/css" href="public/index.css"/>
        </head>
      
      <body>
        <div id="app">${reactDom}</div>
        <script src="public/bundle.js"></script>
      </body>
    </html>
  `;
export default htmlTemplate;
