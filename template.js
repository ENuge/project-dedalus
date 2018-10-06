// @flow
const htmlTemplate = (reactDom: string) => `
    <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Dedalus</title>
        </head>
      
      <body>
        <div id="app">${reactDom}</div>
        <script src="<TODO_LOCATION>"></script>
      </body>
    </html>
  `;
export default htmlTemplate;
