# Achinsky Construction Company — Website

Static site (plain HTML/CSS/JS, no build step). Works by just opening `index.html`,
and deploys to GitHub Pages as-is.

```
achinsky-construction/
├── index.html          all page content
├── css/styles.css      styling + light/dark themes
├── js/config.js        <- EmailJS keys go here
├── js/main.js          interactions
└── assets/img/         <- project photos + logo go here
```

---

## 1. Run it locally

Double-click `index.html`, or serve it (better — matches production):

```bash
python -m http.server 8000
```

Then open http://localhost:8000

---

## 2. Project photos — already in place

All ten gallery photos are installed, processed from `Downloads/Site Files`.
`tools/process_photos.py` records which source file feeds each slot; re-run it with
`python tools/process_photos.py` after changing the mapping.

What the script does: pulls the finished "after" panel out of the before/after
collages, corrects phone rotation, crops to 4:3, and compresses to progressive JPEG.

**Some sources are low resolution.** These look soft when opened in the lightbox —
if you can find the original camera files, drop them in and re-run the script:

| File | Current | Ideal |
|---|---|---|
| `blue-kale-cafe.jpg` | 384×288 | 1200×900 |
| `bathroom-chicago.jpg` | 523×392 | 1200×900 |
| `salon.jpg`, `kitchen-glenview.jpg`, `living-chicago.jpg`, `garage-morton-grove.jpg` | 540×405 | 1200×900 |

The four collage-derived ones are small because a quarter of a 1080px collage is only
540px — the full-resolution originals of those individual shots would be much better.
`kitchen-skokie`, `living-ulaanbaatar`, `luma-head-spa` and `shalom-nail-salon` are fine.

The script never upscales, since enlarging just adds softness without adding detail.

To swap any photo by hand, replace the file in `assets/img/` keeping the same name.
If a file is missing the site shows a labeled placeholder rather than a broken image.

### Logo — already done

The real logo is in place. It was cropped from `assets/source/achinsky-logo-original.jpg`
and the white background was converted to transparency so it also works on the dark theme.

| File | Used for | Size |
|---|---|---|
| `logo-mark.png` | Header (swirl only) | 256×306 |
| `logo.png` | About section (full lockup with wordmark) | 700×1038 |
| `favicon.png` | Browser tab + phone home screen | 180×180 |

The site palette was resampled from the artwork — red `rgb(232,6,6)`, blue `rgb(21,121,209)`
— then nudged a shade darker in `css/styles.css` so small text clears WCAG AA contrast.

To regenerate them (e.g. from updated artwork), edit the paths at the top of
`tools/make_logo.py` and run `python tools/make_logo.py` (needs `pillow` and `numpy`).
Or just replace the three PNGs directly, keeping the same filenames.

---

## 3. Make the contact form send email (EmailJS)

The form validates and works right now, but until it's connected it tells visitors
to email you directly. To turn on real sending:

1. Sign up free at <https://www.emailjs.com/>
2. **Email Services** → Add **Gmail** → connect `Achinsky.construction@gmail.com` → copy the **Service ID**
3. **Email Templates** → Create a template → copy the **Template ID**

   Set **To Email** to the address that receives leads, **From Name** to `{{name}}`,
   and **Reply To** to `{{email}}` (so hitting Reply goes to the customer).

   **Subject:**
   ```
   New project inquiry: {{project_type}} — {{name}}
   ```

   **Content:**
   ```
   New project inquiry from the website.

   Name:           {{first_name}} {{last_name}}
   Email:          {{email}}
   Phone:          {{phone}}

   Project type:   {{project_type}}
   Address:        {{address}}
   City / ZIP:     {{city}} {{zip}}
   Country:        {{country}}

   Details:
   {{details}}

   Submitted {{time}}
   ```

   Available variables: `first_name`, `last_name`, `email`, `phone`, `country`,
   `address`, `city`, `zip`, `project_type`, `details` — plus `name` (full name),
   `title` (= project type), `time`, and `message` (a pre-formatted summary of
   everything). The last four exist so EmailJS's stock template renders correctly
   even if you don't rewrite it.
4. **Account → General** → copy the **Public Key**
5. Paste all three into `js/config.js`

The public key is designed to be public — it's safe to commit.

Free tier covers 200 emails/month, which is plenty for an inbound contact form.

---

## 4. Publish on GitHub Pages

```bash
cd ~/Documents/achinsky-construction
git init
git add .
git commit -m "Achinsky Construction website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/achinsky-construction.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `root` → Save**.

Live in ~1 minute at `https://YOUR_USERNAME.github.io/achinsky-construction/`

**Custom domain** (e.g. `achinskyconstruction.com`): add it under Settings → Pages,
then point your registrar's DNS at GitHub. Keep `CNAME` in the repo once created.

---

## 5. Things you'll likely want to edit

| What | Where |
|---|---|
| Headline / tagline | `index.html` → `.hero` section |
| Stat numbers (years, projects) | `index.html` → `#stats`, `data-count` attributes |
| Service descriptions | `index.html` → `#services` |
| Financial figures | `index.html` → `.figures` block |
| Testimonials (currently placeholder) | `index.html` → `#testimonials` |
| Phone / email / address | `index.html` → `#contact` → `.branches` |
| Brand colors | `css/styles.css` → `:root` → `--red`, `--blue` |

---

## Features built in

- Light/dark theme toggle (remembers the visitor's choice, follows OS default first)
- Filterable project gallery (All / Commercial / Residential)
- Full-screen lightbox with keyboard arrows + Escape
- Scroll-reveal animations and animated stat counters
- Reading-progress bar in the header
- Mobile hamburger nav
- Client-side form validation + honeypot spam trap
- Accessible: skip link, focus styles, ARIA labels, respects `prefers-reduced-motion`
- Responsive down to small phones
