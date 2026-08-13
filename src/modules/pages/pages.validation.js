const Joi = require("joi");

const seo_fields = {
  type: Joi.string().valid("blog", "article", "event", "news").messages({
    "any.only": "Type must be blog, article, event, or news.",
  }),
  meta_title: Joi.string().allow("", null).messages({
    "string.base": "Meta title must be valid text.",
  }),
  meta_description: Joi.string().allow("", null).messages({
    "string.base": "Meta description must be valid text.",
  }),
  meta_keywords: Joi.string().allow("", null).messages({
    "string.base": "Meta keywords must be valid text.",
  }),
  image_alt: Joi.string().allow("", null).messages({
    "string.base": "Image alt text must be valid text.",
  }),
};

exports.create_blogs_validation = Joi.object({
  title: Joi.string().required().messages({
    "string.base": "Please enter a valid title using letters.",
    "any.required":
      "Title is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  slug: Joi.string().required().messages({
    "string.base": "Please enter a valid slug using letters.",
    "any.required":
      "Slug is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  image: Joi.string().messages({
    "string.base": "Image Please enter valid text.",
  }),
  dark_content: Joi.string().allow("").messages({
    "string.base": "Dark Content Please enter valid text.",
  }),
  faded_content: Joi.string().allow("").messages({
    "string.base": "Faded Content Please enter valid text.",
  }),
  related_blogs: Joi.array(),
  sub_sections: Joi.array().items(
    Joi.object({
      title: Joi.string().required().messages({
        "string.base": "Please enter a valid title using letters.",
        "any.required":
          "Title is required. Don’t leave it blank. Please make sure to fill it in.",
      }),
      content: Joi.string().required().messages({
        "string.base": "Please enter a valid content using letters.",
        "any.required":
          "Content is required. Don’t leave it blank. Please make sure to fill it in.",
      }),
    })
  ),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
  ...seo_fields,
});

exports.edit_blogs_validation = Joi.object({
  title: Joi.string().required().messages({
    "string.base": "Please enter a valid title using letters.",
    "any.required":
      "Title is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  slug: Joi.string().required().messages({
    "string.base": "Please enter a valid slug using letters.",
    "any.required":
      "Slug is required. Don’t leave it blank. Please make sure to fill it in.",
  }),
  image: Joi.string().messages({
    "string.base": "Image Please enter valid text.",
  }),
  dark_content: Joi.string().allow("").messages({
    "string.base": "Dark Content Please enter valid text.",
  }),
  faded_content: Joi.string().allow("").messages({
    "string.base": "Faded Content Please enter valid text.",
  }),
  related_blogs: Joi.array(),
  sub_sections: Joi.array(),
  status: Joi.string().messages({
    "string.base": "Status Please enter valid text.",
  }),
  ...seo_fields,
});
