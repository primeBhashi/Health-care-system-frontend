const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// @route   POST api/items
// @desc    Create an item
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ msg: 'Please provide name and description' });
    }
    const newItem = {
      name,
      description,
      createdAt: new Date(),
    };
    const result = await req.app.locals.db.collection('items').insertOne(newItem);
    // For MongoDB driver v3.x, result.ops[0] contains the inserted document.
    // For v4.x and later, insertOne returns an object with insertedId.
    // We'll fetch the document by its ID for broader compatibility and to ensure we return the actual DB state.
    if (result.insertedId) {
      const insertedItem = await req.app.locals.db.collection('items').findOne({ _id: result.insertedId });
      res.status(201).json(insertedItem);
    } else if (result.ops && result.ops.length > 0) { // Fallback for older driver versions
      res.status(201).json(result.ops[0]);
    } else {
       // If neither ops nor insertedId is present, something is unexpected.
       // Return newItem as a fallback, though it won't have _id or other DB-generated fields.
      res.status(201).json(newItem);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items
// @desc    Get all items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await req.app.locals.db.collection('items').find({}).toArray();
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items/:id
// @desc    Get a single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid item ID format' });
    }
    const item = await req.app.locals.db.collection('items').findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/items/:id
// @desc    Update an item by ID
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid item ID format' });
    }
    const { name, description } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ msg: 'No fields to update provided' });
    }

    const result = await req.app.locals.db.collection('items').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    // Fetch and return the updated item to confirm changes
    const updatedItem = await req.app.locals.db.collection('items').findOne({ _id: new ObjectId(id) });
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete an item by ID
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid item ID format' });
    }
    const result = await req.app.locals.db.collection('items').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.json({ msg: 'Item deleted', id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
