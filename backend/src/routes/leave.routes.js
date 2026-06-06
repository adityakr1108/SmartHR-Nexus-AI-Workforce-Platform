const express = require('express');
const router = express.Router();
const { protect, managementOnly } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/errorUtils');
const Leave = require('../models/Leave.model');

// @route   GET /api/v1/leaves
// @desc    Get all leave requests (filtered for employees)
router.get('/', protect, asyncHandler(async (req, res) => {
  const query = {};

  // Employees can only fetch their own leaves
  if (req.user.role === 'employee') {
    query.employee = req.user._id;
  } else if (req.query.employeeId) {
    query.employee = req.query.employeeId;
  }

  // Populate employee details (User name, department name, position)
  const leaves = await Leave.find(query)
    .populate({
      path: 'employee',
      select: 'firstName lastName email department position avatar',
      populate: {
        path: 'department',
        select: 'name code'
      }
    })
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
}));

// @route   POST /api/v1/leaves
// @desc    Submit a leave request
router.post('/', protect, asyncHandler(async (req, res) => {
  const { leaveType, reason, startDate, endDate, totalDays } = req.body;

  if (!leaveType || !reason || !startDate || !endDate || !totalDays) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const leave = await Leave.create({
    employee: req.user._id,
    leaveType: leaveType.toLowerCase(),
    reason,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    totalDays,
    status: 'pending',
  });

  res.status(201).json({ success: true, data: leave, message: 'Leave request submitted successfully' });
}));

// @route   PATCH /api/v1/leaves/:id/approve
// @desc    Approve a leave request (restricted to managers and admins)
router.patch('/:id/approve', protect, managementOnly, asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave request not found' });
  }

  leave.status = 'approved';
  leave.approvedBy = req.user._id;
  leave.approvedAt = new Date();
  leave.comments = req.body.comments || 'Approved. Enjoy your time off!';
  await leave.save();

  res.json({ success: true, data: leave, message: 'Leave approved successfully' });
}));

// @route   PATCH /api/v1/leaves/:id/reject
// @desc    Reject a leave request (restricted to managers and admins)
router.patch('/:id/reject', protect, managementOnly, asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave request not found' });
  }

  leave.status = 'rejected';
  leave.approvedBy = req.user._id;
  leave.approvedAt = new Date();
  leave.comments = req.body.comments || 'Rejected';
  await leave.save();

  res.json({ success: true, data: leave, message: 'Leave rejected successfully' });
}));

module.exports = router;
