const { Content } = require('../models');

exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.findAll();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error getting content', error });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { title, body, type } = req.body;
    const content = await Content.create({ title, body, type });
    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    res.status(500).json({ message: 'Error creating content', error });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error getting content', error });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { title, body, type } = req.body;
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    content.title = title;
    content.body = body;
    content.type = type;
    await content.save();
    res.status(200).json({ message: 'Content updated successfully', content });
  } catch (error) {
    res.status(500).json({ message: 'Error updating content', error });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    await content.destroy();
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting content', error });
  }
};
