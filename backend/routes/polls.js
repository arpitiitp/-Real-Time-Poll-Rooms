const router = require('express').Router();
const Poll = require('../models/Poll');
const { isIP } = require('net');

// Create a new poll
router.post('/', async (req, res) => {
    try {
        const { question, options } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({ message: 'Polls need a question and at least 2 options.' });
        }

        const newPoll = await Poll.create({
            question,
            options: options.map(opt => ({ text: opt, votes: 0 }))
        });

        res.status(201).json(newPoll);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create poll' });
    }
});

// Get poll details
router.get('/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching poll' });
    }
});

// Cast a vote
router.post('/:id/vote', async (req, res) => {
    const { optionIndex } = req.body;
    const { id } = req.params;
    const userIp = req.ip;

    try {
        // Simple double-voting check
        const poll = await Poll.findById(id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.ipAddressesVoted.includes(userIp)) {
            return res.status(403).json({ message: 'You have already voted.' });
        }

        // Atomic update to ensure accuracy
        const updatedPoll = await Poll.findByIdAndUpdate(
            id,
            {
                $inc: { [`options.${optionIndex}.votes`]: 1 },
                $push: { ipAddressesVoted: userIp }
            },
            { new: true }
        );

        // Notify everyone in the room
        req.io.to(id).emit('voteUpdate', updatedPoll);

        res.json(updatedPoll);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Vote failed' });
    }
});

module.exports = router;
