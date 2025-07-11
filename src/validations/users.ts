import Joi from "@hapi/joi";

export const userSchema = Joi.object({
    phone_number: Joi.string()
        .required("Phone number is required")
        .pattern(
            /^(?:\+1\s?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/,
            "Invalid phone number format",
        ),
    name: Joi.string().required("Name is required"),
    email: Joi.string()
        .required("Email is required")
        .email({
            minDomainSegments: 2,
        })
        .message("Invalid email address"),
    organization: Joi.string().required("Organization is required"),
    title: Joi.string().required("title is required"),
});

export const verifyCodeValidation = Joi.object({
    code: Joi.string().required("Code is required"),
});

export const loginFormValidation = Joi.object({
    email: Joi.string().required("Email is required"),
    password: Joi.string().required("Password is required"),
});
