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

## Project structure

```text
.
├── assets/
│   └── images/
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── about.html
├── contact.html
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
- The forms include name, email, optional contact number, project type, and message fields. The success popup appears after the service confirms a successful submission.
- The WhatsApp button opens a chat with a prefilled message. Update its `wa.me` link in both contact forms if the destination number or default message changes.

## Interactive features

`js/main.js` handles the mobile navigation, project carousel, scroll effects, and contact form behavior. `css/styles.css` contains the shared styles and responsive layouts.

There is currently no configured build script or automated test suite.
