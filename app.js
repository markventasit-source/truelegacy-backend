require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const response_handler = require("./src/helpers/response_handler");
const routes = require("./src/routes");
const fs = require("fs");
const path = require("path");
const { get_blog_by_slug } = require("./src/modules/pages/pages.controller");
const axios = require("axios");

//! Create an instance of the Express application
const app = express();
//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://truelegacyindia.com",
    "https://www.truelegacyindia.com",
    "https://admin.truelegacy.in",
    "https://api.truelegacyindia.com",
  ].join(",")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-api-key",
    "ngrok-skip-browser-warning",
    "Accept",
    "Origin",
  ],
  credentials: true,
};

//* Use volleyball for request logging
app.use(volleyball);
//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
//* Parse JSON request bodies with increased size limit
app.use(express.json({ limit: "10mb" }));
//* Parse URL-encoded request bodies with increased size limit
app.use(express.urlencoded({ limit: "10mb", extended: true }));
//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;
//! Import database connection module
require("./src/config/connection");
//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return response_handler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master - production 🗝️?",
  );
});

//* Health Check Route
app.get("/health", (req, res) => {
  return response_handler(res, 200, "✅ Server is healthy", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

//* Configure routes for user API
app.use(BASE_PATH, routes);

// --- DYNAMIC SEO INJECTION (Fetch-and-Inject) ---
const FRONTEND_URL = process.env.FRONTEND_URL || "";

app.get("/resources/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    // 1. Fetch blog details from DB first to ensure we have data
    const blog = await get_blog_by_slug(slug);

    // 2. Fetch the base HTML from the live frontend
    const response = await axios.get(`${FRONTEND_URL}/index.html`, {
      headers: { "User-Agent": "TrueLegacy-SEO-Proxy" },
    });
    let html = response.data;

    if (blog) {
      const title = blog.meta_title || `${blog.title} | True Legacy`;
      const description = (
        blog.meta_description ||
        blog.description ||
        "Secure your family's future with expert succession planning."
      )
        .substring(0, 160)
        .trim();
      const keywords = blog.meta_keywords || "";

      const image = blog.image || `${FRONTEND_URL}/og-image.jpg`;
      const url = `${FRONTEND_URL}/resources/${slug}`;
      // Flexible Tag Replacement (Handles different attribute orders and closing tags)
      const replaceMeta = (tagName, attrName, attrValue, newContent) => {
        const regex = new RegExp(
          `<meta[^>]*${attrName}=["']${attrValue}["'][^>]*>`,
          "i",
        );
        if (regex.test(html)) {
          html = html.replace(
            regex,
            `<meta ${attrName}="${attrValue}" content="${newContent}" />`,
          );
        } else {
          // If tag doesn't exist, prepend it to </head>
          html = html.replace(
            "</head>",
            `<meta ${attrName}="${attrValue}" content="${newContent}" />\n</head>`,
          );
        }
      };

      // Update Title
      if (/<title>.*?<\/title>/i.test(html)) {
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
      } else {
        html = html.replace("</head>", `<title>${title}</title>\n</head>`);
      }

      // Update OG Tags
      replaceMeta("meta", "property", "og:title", title);
      replaceMeta("meta", "property", "og:description", description);
      replaceMeta("meta", "property", "og:image", image);
      replaceMeta("meta", "property", "og:url", url);

      // Update Twitter Tags
      replaceMeta("meta", "name", "twitter:title", title);
      replaceMeta("meta", "name", "twitter:description", description);
      replaceMeta("meta", "name", "twitter:image", image);
      replaceMeta("meta", "name", "twitter:url", url);

      // Update Standard Description + Keywords
      replaceMeta("meta", "name", "description", description);
      if (keywords) {
        replaceMeta("meta", "name", "keywords", keywords);
      }
    }

    return res.send(html);
  } catch (err) {
    // Return original HTML if possible, or error
    try {
      const response = await axios.get(`${FRONTEND_URL}/index.html`);
      return res.send(response.data);
    } catch (fetchErr) {
      return res.status(500).send("Server Error: Unable to fetch base HTML.");
    }
  }
});

//* No route matched for API
app.use(`${BASE_PATH}/*path`, (req, res) => {
  return response_handler(res, 404, "🚫 API Route not found");
});

app.listen(PORT, () => {
  const port_message = clc.redBright(`✓ App is running on port: ${PORT}`);
  const env_message = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`,
  );
  console.log(`${port_message}\n${env_message}`);
});
