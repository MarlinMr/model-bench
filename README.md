# Dynamic Bob Ross Canvas Simulation for model benchmark

An interactive, self-contained HTML canvas simulation featuring a dynamic landscape in the style of Bob Ross. The scene paints itself sequentially on startup and animates with moving water, flying birds, and gentle wind effects.

## Live Demo
Check out the live page here: https://marlinmr.github.io/model-bench/

## Deployment

Before the first deployment, open the repository's **Settings → Pages** and
select **GitHub Actions** as the source under **Build and deployment**.
This one-time setup requires repository administrator access; the workflow's
`GITHUB_TOKEN` cannot create the Pages site, even with `pages: write`.

After saving that setting, rerun **Deploy static content to Pages** from the
**Actions** tab. The workflow also deploys automatically on pushes to `main`.

## Blind comparison

Click **Random page** on the homepage to open a simulation without displaying
its model name. The viewer's **Random page** button selects another simulation
(avoiding an immediate repeat when multiple pages are available).
The viewer banner shows only the HTML file size (bytes and KiB) and line count,
without displaying the original filename or model identity.
When you have formed an opinion, click **Reveal model** in the viewer banner.
The identity is loaded only on request and is hidden again on the next selection.
Labels are derived from the HTML filename, with underscores replaced by spaces.

Add self-contained HTML outputs under `models/`. During deployment,
`scripts/build_site.py` copies every `models/**/*.html` file to an anonymous,
randomly named URL and generates the viewer's page list. The address bar shows
`viewer.html#<opaque-id>`; refreshing keeps the same selection. IDs are regenerated
on each deployment, so old blind links are not permanent.

HTML outputs are deployed as anonymous copies; the page list contains no model
names. Separate identity JSON files support the optional reveal button.
This is presentation-level obfuscation: the repository remains public,
and text inside a simulation could identify its author. Use
outputs without model-identifying content for a blind comparison.

To preview the generated site locally:

```sh
python3 scripts/build_site.py /tmp/model-bench-site
python3 -m http.server 8000 --directory /tmp/model-bench-site
```

Open http://localhost:8000 and click **Random page**.

## Features
- **Sequential Painting:** Renders background, mountains, trees, and foreground elements step-by-step upon load.
- **Dynamic Elements:** Flowing water, drifting clouds, fluttering leaves, and flying birds.
- **Single File Build:** Completely self-contained HTML, CSS, and JS.

Prompt used: 

>I want a web page that is self-contained inside a single HTML file. The entire purpose of the page is to display an animated simulation.

>The simulation features a picture frame containing a landscape in the signature painterly style of Bob Ross. Instead of a static image, it is a dynamic, living scene: gentle wind rustles trees, birds fly across the sky, water flows in a stream, clouds drift, and other subtle elements move naturally. The focus should be on art, beauty, and atmosphere rather than strict physical accuracy.

>Additionally, elements within the frame should be painted sequentially upon startup—revealing background, mountains, trees, and foreground details one by one as if the artwork is being created live on canvas.

>Construct the complete, self-contained HTML file based on these instructions.
