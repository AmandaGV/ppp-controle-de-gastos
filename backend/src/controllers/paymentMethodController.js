const { paymentMethodService } = require('../dependencies');

async function listMethods(req, res) {
  try {
    const methods = await paymentMethodService.listMethods();
    res.json(methods);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function addMethod(req, res) {
  try {
    const method = await paymentMethodService.addMethod(req.body);
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateMethod(req, res) {
  try {
    const method = await paymentMethodService.updateMethod({ currentName: req.params.name, newName: req.body.newName });
    res.json(method);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteMethod(req, res) {
  try {
    const response = await paymentMethodService.deleteMethod({ name: req.params.name });
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  listMethods,
  addMethod,
  updateMethod,
  deleteMethod,
};
