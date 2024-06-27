const express = require('express');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === 'admin';
  } catch (err) {
    return false;
  }
};

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      console.log('admin role not found');
      return res.status(403).json({ message: 'User does not have admin role' });
    } else {
      console.log('admin role found');
    }

    const data = req.body; // Assuming the request body contains the candidate data
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log('Candidate data saved');
    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT route to update a candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateId = req.params.candidateId; // Extract id from URL parameter
    const updatedCandidateData = req.body; // Updated data for candidate

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
      new: true, // Return the updated document
      runValidators: true, // Run mongoose validation
    });

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('Candidate data updated');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// DELETE route to remove a candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }

    const candidateId = req.params.candidateId; // Extract id from URL parameter

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log('Candidate deleted');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//start voting

router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    // Find the candidate document with specified candidateId
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Find the user document with specified userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already voted
    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Check if the user is an admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin cannot vote' });
    }

    // Record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // Update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//vote count
router.get('/vote/count',async(req,res)=>{
  try{
    //find all the candidates and sort them by voteCount in descending order
    const candidate=await Candidate.find().sort({voteCount:'desc'})

    //Map the candidates to only return their name and voteCount
    const voteRecord=candidate.map((data)=>{
      return {
        party:data.party,
        count:data.voteCount
      }
    })
    return res.status(200).json(voteRecord)


  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})
router.get('/',async(req,res)=>{
  try{
    //list of candidates
    const data=await Candidate.find()
  console.log('data fetched')
   return  res.status(200).json(data)

  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router;
