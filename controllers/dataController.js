const Submission = require("../models/Submission");
const Form = require("../models/Form");
const mongoose = require("mongoose");

// @desc    Submit form data
// @route   POST /api/data/:formId
// @access  Private
const submitFormData = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if form is public or user has access
    if (!form.isPublic && form.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to submit this form" });
    }

    const submission = await Submission.create({
      userId: req.user._id,
      formId: req.params.formId,
      data: req.body.data,
      status: req.body.status || "submitted",
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions for a specific form
// @route   GET /api/data/:formId
// @access  Private
const getFormSubmissions = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has access to form submissions
    if (form.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view submissions" });
    }

    const submissions = await Submission.find({ formId: req.params.formId })
      .populate("userId", "username email")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific submission
// @route   GET /api/data/:formId/:submissionId
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has access to submission
    if (form.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view submission" });
    }

    const submission = await Submission.findOne({
      _id: req.params.submissionId,
      formId: req.params.formId,
    }).populate("userId", "username email");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a submission
// @route   DELETE /api/data/:formId/:submissionId
// @access  Private
const deleteSubmission = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if user has access to delete submission
    if (form.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete submission" });
    }

    const submission = await Submission.findOneAndDelete({
      _id: req.params.submissionId,
      formId: req.params.formId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ message: "Submission removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit form data without authentication
// @route   POST /api/data/public/submit
// @access  Public
const submitFormDataPublic = async (req, res) => {
  try {
    console.log(
      "Form submission payload received:",
      JSON.stringify(req.body, null, 2)
    );

    const { formId, userId, sections } = req.body;

    console.log("Public form submission request:", {
      formId,
      userId,
      sectionsCount: sections ? sections.length : 0,
    });

    // Check basic structure first
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "Invalid request body format",
        details: "Request body should be a valid JSON object",
      });
    }

    // Validate required fields
    if (!formId || !userId || !sections || !Array.isArray(sections)) {
      return res.status(400).json({
        message: "Missing or invalid required fields",
        errors: [
          !formId && "formId is required",
          !userId && "userId is required",
          (!sections || !Array.isArray(sections)) &&
            "sections must be a valid array",
        ].filter(Boolean),
        format: {
          userId: "MongoDB ObjectId of the user",
          formId: "Form identifier",
          sections: [
            {
              sectionId: "Section identifier",
              sectionTitle: "Section title",
              questions: [
                {
                  questionId: "Question identifier",
                  questionType:
                    "Question type (e.g., 'text', 'single-select', etc.)",
                  response: "User's response",
                  responseId: "Optional response identifier for selections",
                },
              ],
            },
          ],
        },
      });
    }

    // Validate each section has required fields
    for (const section of sections) {
      if (
        !section.sectionId ||
        !section.sectionTitle ||
        !Array.isArray(section.questions)
      ) {
        return res.status(400).json({
          message: "Invalid section format",
          errors: [
            !section.sectionId && "Section ID is required for each section",
            !section.sectionTitle &&
              "Section title is required for each section",
            (!section.questions || !Array.isArray(section.questions)) &&
              "Questions must be a valid array for each section",
          ].filter(Boolean),
          section,
        });
      }

      // Validate each question has required fields (only if questions array is not empty)
      for (const question of section.questions) {
        if (!question.questionId || !question.questionType) {
          return res.status(400).json({
            message: "Invalid question format",
            errors: [
              !question.questionId &&
                "Question ID is required for each question",
              !question.questionType &&
                "Question type is required for each question",
            ].filter(Boolean),
            question,
            sectionId: section.sectionId,
          });
        }
      }
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format",
        details: "UserId must be a valid MongoDB ObjectId",
      });
    }

    // Find the form - try multiple approaches
    console.log(
      `Looking for form with formId: ${formId} and userId: ${userId}`
    );

    // First try exact match
    let form = await Form.findOne({
      formId,
      userId,
    });

    // If not found, try case-insensitive match (if formId is a string)
    if (!form && typeof formId === "string") {
      console.log(
        `Form not found by exact match, trying case-insensitive match`
      );
      form = await Form.findOne({
        formId: { $regex: new RegExp(`^${formId}$`, "i") },
        userId,
      });
    }

    // If not found, try by MongoDB _id
    if (!form && mongoose.Types.ObjectId.isValid(formId)) {
      console.log(`Form not found by formId, trying with _id: ${formId}`);
      form = await Form.findOne({
        _id: formId,
        userId,
      });
    }

    // If still not found, try querying all forms for this user and log them for debugging
    if (!form) {
      const allUserForms = await Form.find({ userId }).select(
        "formId formTitle"
      );
      console.log(
        `No form found. Available forms for user ${userId}:`,
        JSON.stringify(allUserForms, null, 2)
      );

      return res.status(404).json({
        message: "Form not found",
        details:
          "No form found with the provided formId and userId combination.",
        availableForms: allUserForms,
      });
    }

    console.log(`Form found: ${form._id}, title: ${form.formTitle}`);

    // Format data before saving to maintain structure
    const formattedData = {
      sections: sections.map((section) => ({
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        questions: section.questions.map((question) => ({
          questionId: question.questionId,
          questionType: question.questionType,
          response: question.response,
          responseId: question.responseId || null,
        })),
      })),
    };

    // Create the submission
    const submission = await Submission.create({
      userId,
      formId: form._id, // Use the MongoDB ID of the form
      data: formattedData,
      status: req.body.status || "submitted",
    });

    console.log(`Submission created successfully with ID: ${submission._id}`);

    res.status(201).json({
      message: "Form submission successful",
      submissionId: submission._id,
      submittedAt: submission.submittedAt,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error in public form submission:", error);
    res.status(500).json({
      message: "Error processing form submission",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get form data and all submissions for a specific form
// @route   GET /api/data/form-with-submissions/:formId
// @access  Private
const getFormWithSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    const { userId } = req.query;
    console.log(
      `Retrieving form and submissions for formId: ${formId}, user: ${req.user._id}`
    );

    // Find the form by MongoDB _id
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
        details: `No form found with MongoDB ID: ${formId}`,
      });
    }

    // Check if user has access to this form
    if (form.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
        details: "You don't have permission to access this form",
      });
    }

    // Find all submissions for this form
    const submissions = await Submission.find({
      formId: formId,
      userId: req.user._id,
    }).sort({ submittedAt: -1 });

    // Return both form and submissions
    res.json({
      form,
      submissions,
    });
  } catch (error) {
    console.error("Error retrieving form with submissions:", error);
    res.status(500).json({
      message: "Error retrieving form data and submissions",
      error: error.message,
    });
  }
};

// Public version that accepts userId parameter
// @desc    Get form data and all submissions without authentication
// @route   GET /api/data/public/form-with-submissions/:formId
// @access  Public
const getFormWithSubmissionsPublic = async (req, res) => {
  try {
    const { formId } = req.params;
    const { userId } = req.query;

    console.log(
      `Public request for form and submissions - formId: ${formId}, userId: ${userId}`
    );

    if (!formId || !userId) {
      return res.status(400).json({
        message: "Missing required parameters",
        details: "Both formId and userId are required",
      });
    }

    // Validate userId is a valid ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(formId)
    ) {
      return res.status(400).json({
        message: "Invalid userId format",
        details: "Both userId and formId must be valid MongoDB ObjectIds",
      });
    }

    // Find the form by MongoDB _id
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
        details: `No form found with MongoDB ID: ${formId}`,
      });
    }

    // Check if form belongs to the specified user
    if (form.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Invalid userId for form",
        details: "The specified userId does not match the form owner",
      });
    }

    // Find all submissions for this form and user
    const submissions = await Submission.find({
      formId: formId,
      // userId: userId,
    }).sort({ submittedAt: -1 });

    if (submissions.length > 0) {
      console.log(
        `Sample Submission Ids are  ${submissions
          .slice(0, 3)
          .map((s) => s._id)
          .join(", ")}`
      );
    } else {
      console.log("No submissions found for this form.");
    }

    // Return both form and submissions
    res.json({
      form,
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error("Error retrieving public form with submissions:", error);
    res.status(500).json({
      message: "Error retrieving form data and submissions",
      error: error.message,
    });
  }
};

module.exports = {
  submitFormData,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmission,
  submitFormDataPublic,
  getFormWithSubmissions,
  getFormWithSubmissionsPublic,
};
