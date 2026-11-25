# Pier & Parcel – E-commerce Demo Store

A lightweight storefront built with plain HTML, CSS and JavaScript. No frameworks, no build step.

Product data is **real, live data** from the free [Fake Store API](https://fakestoreapi.com/products) (clothing, jewelery, electronics, with prices, ratings and images).

## Features

- Live product catalogue fetched from a public REST API
- Category filters, text search and sorting (price, rating)
- Shopping cart drawer with quantity controls and running total
- Cart saved in `localStorage`, so it survives page reloads
- Offline fallback data if the API is unreachable
- Responsive layout, keyboard-friendly, supports dark mode and reduced motion
- Demo checkout (no payments are processed)

## Project structure

```
├── index.html   # Page structure
├── Style.css    # Styles (light/dark, responsive)
├── Script.js    # Fetching, filtering, cart logic
└── ReadMe.md
```

> File names are case-sensitive on GitHub Pages. Keep `Style.css` and `Script.js` capitalised as shown, or update the links in `index.html`.

## Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```
2. Open `index.html` in a browser, or serve it:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit http://localhost:8000.

## Deploy on GitHub Pages

1. Push the files to the root of your repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your store will be live at `https://<your-username>.github.io/<your-repo>/`.

## Customise

- **Swap the data source:** change `API_URL` in `Script.js`. Any API that returns objects with `id`, `title`, `price`, `category`, `image` and `rating: { rate, count }` works.
- **Rebrand:** edit the colour variables at the top of `Style.css` and the name in `index.html`.

## Roadmap ideas

- Product detail pages
- Wishlist
- Real checkout with Stripe Checkout or PayPal

## Credits

Product data and images: [Fake Store API](https://fakestoreapi.com). Fonts: Bricolage Grotesque and DM Sans via Google Fonts.

## License

MIT. Use it freely.
