# Daxentra Studio Website

A responsive, static multi-page website for Daxentra, a digital studio. It is built with HTML, CSS, and vanilla JavaScript; no build step or package installation is required.

## Pages

- `index.html` — homepage with studio overview, services, work, team, process, FAQs, and contact form
- `about.html` — studio information
- `services.html` — services
- `work.html` — portfolio
- `team.html` — team and testimonials
- `process.html` — process and FAQs
- `contact.html` — standalone contact page
- `careers.html` — internship programs and student application form

## Project structure

```text
.
├── assets/
│   └── images/
├── css/
│   ├── careers.css
│   └── styles.css
├── js/
│   ├── careers.js
│   └── main.js
├── about.html
├── contact.html
├── careers.html
├── index.html
├── process.html
├── services.html
├── team.html
└── work.html
```

## Run locally

Serve the project directory with Python:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000>. You can also use a static-site preview extension in your editor.

## Contact integrations

- The contact forms on `index.html` and `contact.html` submit to Web3Forms. Configure the access key in each form and confirm the recipient address in the Web3Forms dashboard. The access key is included in client-side HTML, so it is not a private server-side secret.
- The internship application form on `careers.html` also submits to Web3Forms using the site's existing access key.
- The forms include name, email, optional contact number, project type, and message fields. The success popup appears after the service confirms a successful submission.
- The WhatsApp button opens a chat with a prefilled message. Update its `wa.me` link in both contact forms if the destination number or default message changes.

## Interactive features

`js/main.js` handles the shared mobile navigation, project carousel, scroll effects, theme, and contact form behavior. `js/careers.js` handles the internship program filters and application form. `css/styles.css` contains shared styles; `css/careers.css` contains the careers page styling.

There is currently no configured build script or automated test suite.
