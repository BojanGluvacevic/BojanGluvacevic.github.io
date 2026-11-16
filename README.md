# Spark Help

Spark Help is a static GitHub Pages site presenting a collection of small operations, reporting, and customer-support tools. The page also includes an Outlook compose-link builder and inspector that run entirely in the browser.

## Local preview

No build step or package installation is required. Serve the repository with any static web server, for example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Saved template format

The mail composer can import plain-text entries in the legacy format below. Values containing commas can be wrapped in double quotes.

```text
#email>EM-001,Template name,recipient@example.com,Subject,Message body
```

Imported files are parsed locally. Their contents are not executed or uploaded.
