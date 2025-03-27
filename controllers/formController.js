const Form = require("../models/Form");

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
const createForm = async (req, res) => {
  console.log("createForm called");
  try {
    const { formTitle, description, sections, order, formId } = req.body;

    // Log the form data for debugging
    console.log("Form data received:", {
      formTitle,
      description,
      order,
      formId,
      sectionsCount: sections ? sections.length : 0,
    });

    const formData = {
      userId: req.user._id,
      formTitle,
      description,
      sections,
      order: order || 1, // Default to 1 if not provided
      formId:
        formId ||
        `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const form = await Form.create(formData);

    res.status(201).json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all forms for logged-in user
// @route   GET /api/forms
// @access  Private
const getForms = async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id });
    res.json(forms);
  } catch (error) {
    console.error("Error getting forms:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific form by ID
// @route   GET /api/forms/:formId
// @access  Private
const getFormById = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.formId,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error("Error getting form by id:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific form by formId
// @route   GET /api/forms/byFormId/:formId
// @access  Private
const getFormByFormId = async (req, res) => {
  try {
    // Allow userId to be specified in query parameters
    const userId = req.query.userId || req.user._id;

    console.log(
      `Getting form with formId: ${req.params.formId}, userId: ${userId}`
    );

    const form = await Form.findOne({
      formId: req.params.formId,
      userId,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error("Error getting form by formId:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a form
// @route   PUT /api/forms/:formId
// @access  Private
const updateForm = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.formId,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Ensure required fields are preserved
    const updateData = {
      ...req.body,
      version: form.version + 1,
      order: req.body.order || form.order || 1,
      formId: req.body.formId || form.formId,
    };

    const updatedForm = await Form.findByIdAndUpdate(
      req.params.formId,
      updateData,
      { new: true }
    );

    res.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a form
// @route   DELETE /api/forms/:formId
// @access  Private
const deleteForm = async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.formId,
      userId: req.user._id,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    await Form.findByIdAndDelete(req.params.formId);
    res.json({ message: "Form removed" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a form by formId
// @route   PUT /api/forms/byFormId/:formId
// @access  Private
const updateFormByFormId = async (req, res) => {
  try {
    console.log(
      `Updating form with formId: ${req.params.formId}, userId: ${
        req.body.userId || req.user._id
      }`
    );

    // Allow override of userId if provided in body, otherwise use authenticated user
    const userId = req.body.userId || req.user._id;

    // Find the form by formId and userId
    const form = await Form.findOne({
      formId: req.params.formId,
      userId,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Ensure required fields are preserved
    const updateData = {
      ...req.body,
      version: form.version + 1,
      order: req.body.order || form.order || 1,
      formId: req.params.formId, // Preserve the formId
      userId, // Preserve the userId
    };

    const updatedForm = await Form.findByIdAndUpdate(form._id, updateData, {
      new: true,
    });

    console.log(`Form updated successfully: ${updatedForm._id}`);
    res.json(updatedForm);
  } catch (error) {
    console.error("Error updating form by formId:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get form data without authentication
// @route   GET /api/forms/public/:formId
// @access  Public
const getFormPublic = async (req, res) => {
  try {
    const { formId } = req.params;
    const { userId } = req.query;

    console.log(
      `Public form access request: formId=${formId}, userId=${userId}`
    );

    if (!formId || !userId) {
      return res.status(400).json({
        message: "Missing required parameters",
        errors: [
          !formId && "formId is required",
          !userId && "userId is required in query parameters",
        ].filter(Boolean),
      });
    }

    // Find the form
    const form = await Form.findOne({
      formId,
      userId,
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Return the form data
    res.json({
      formId: form.formId,
      formTitle: form.formTitle,
      description: form.description,
      sections: form.sections,
      version: form.version,
      isPublic: form.isPublic,
    });
  } catch (error) {
    console.error("Error retrieving public form:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  getFormByFormId,
  updateForm,
  deleteForm,
  updateFormByFormId,
  getFormPublic,
};
