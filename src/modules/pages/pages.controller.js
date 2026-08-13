const response_handler = require("../../helpers/response_handler");
const Blogs = require("./blogs.model");
const validation = require("./pages.validation");
const calculate_read_time = require("../../utils/calculate_read_time");

exports.get_blogs = async (req, res) => {
  try {
    const { page_no = 1, limit = 10, status, type, types, slug } = req.query;
    const skip_count = limit * (page_no - 1);
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (slug) {
      filter.slug = slug;
    }
    const known_types = ["blog", "article", "event", "news"];
    if (types) {
      const type_list = String(types)
        .split(",")
        .map((t) => t.trim())
        .filter((t) => known_types.includes(t));
      if (type_list.length) {
        if (type_list.includes("blog")) {
          filter.$or = [
            { type: { $in: type_list } },
            { type: { $exists: false } },
            { type: null },
          ];
        } else {
          filter.type = { $in: type_list };
        }
      }
    } else if (type === "blog") {
      // Treat legacy docs without type as blogs
      filter.$or = [{ type: "blog" }, { type: { $exists: false } }, { type: null }];
    } else if (known_types.includes(type)) {
      filter.type = type;
    }
    const [blogs, total_count] = await Promise.all([
      Blogs.find(filter)
        .skip(skip_count)
        .limit(limit)
        .sort({ createdAt: -1, _id: -1 }),
      Blogs.countDocuments(filter),
    ]);

    return response_handler(
      res,
      200,
      "Blogs fetched ",
      blogs,
      total_count
    );
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.create_blog = async (req, res) => {
  try {
    const { error, value } = validation.create_blogs_validation.validate(
      req.body
    );
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }

    const content_parts = [value.dark_content, value.faded_content];

    if (value.sub_sections && Array.isArray(value.sub_sections)) {
      value.sub_sections.forEach((section) => {
        if (section.content) {
          content_parts.push(section.content);
        }
      });
    }

    const content_for_read_time = content_parts.filter(Boolean).join(" ");
    value.read_time = calculate_read_time(content_for_read_time);

    const blog = await Blogs.create(value);
    return response_handler(res, 200, "Blog created successfully", blog);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.get_blog_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Blog ID is required");
    }

    const [blog, latest_blogs] = await Promise.all([
      Blogs.findByIdAndUpdate(
        id,
        { $inc: { total_views: 1 } },
        { new: true }
      ).populate("related_blogs", "title slug image"),
      Blogs.find({ _id: { $ne: id } })
        .sort({ createdAt: -1, _id: -1 })
        .limit(3),
    ]);

    return response_handler(res, 200, "Blog fetched successfully", {
      blog,
      latest_blogs,
    });
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.update_blog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Blog ID is required");
    }
    const { error, value } = validation.edit_blogs_validation.validate(
      req.body
    );
    if (error) {
      return response_handler(res, 400, error.details[0].message);
    }
    const blog = await Blogs.findByIdAndUpdate(id, value, { new: true });
    return response_handler(res, 200, "Blog updated successfully", blog);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.delete_blog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response_handler(res, 400, "Blog ID is required");
    }
    const blog = await Blogs.findByIdAndDelete(id);
    return response_handler(res, 200, "Blog deleted successfully", blog);
  } catch (error) {
    return response_handler(res, 500, `Internal Server Error ${error.message}`);
  }
};
exports.get_blog_by_slug = async (slug) => {
  try {
    const blog = await Blogs.findOne({ slug: slug, status: 'published' });
    return blog;
  } catch (error) {
    console.error(`❌ Error fetching blog by slug ${slug}:`, error.message);
    return null;
  }
};