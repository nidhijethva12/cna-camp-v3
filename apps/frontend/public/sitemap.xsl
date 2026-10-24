<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Sitemap</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 2rem;
            color: #111827;
            background: #f9fafb;
          }
          h1 {
            margin-bottom: 1rem;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            margin-bottom: 0.5rem;
          }
          a {
            color: #2563eb;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Site map</h1>
        <ul>
          <xsl:for-each select="sm:urlset/sm:url">
            <li>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="sm:loc"/>
                </xsl:attribute>
                <xsl:value-of select="sm:loc"/>
              </a>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
