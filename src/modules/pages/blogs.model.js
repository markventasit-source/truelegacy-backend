const mongoose = require("mongoose");

const blogs_schema = mongoose.Schema(
  {
    title: { type: String, trim: true },
    slug: { type: String, trim: true },
    image: { type: String, trim: true },
    image_alt: { type: String, trim: true },
    dark_content: { type: String, trim: true },
    faded_content: { type: String, trim: true },
    related_blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blogs" }],
    sub_sections: [
      {
        title: { type: String, trim: true },
        content: { type: String, trim: true },
      },
    ],
    type: {
      type: String,
      trim: true,
      enum: ["blog", "article", "event", "news"],
      default: "blog",
    },
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
    meta_keywords: { type: String, trim: true },
    read_time: { type: String, trim: true },
    total_views: { type: Number, default: 0 },
    status: {
      type: String,
      trim: true,
      enum: ["drafted", "published"],
      default: "drafted",
    },
  },
  { timestamps: true }
);

const Blogs = mongoose.model("Blogs", blogs_schema);

module.exports = Blogs;
