import { Request, Response } from "express";
import mongoose from "mongoose";
import MockInterviewModel from "../models/mockinterview.model";
import User from "../models/user.model";

// Create a new mock interview
export const createMockInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming user ID is set in req.user by auth middleware
    const {
      jobRole,
      overallReview,
      overallRating,
      experienceLevel,
      targetCompany,
      skills,
      dsaQuestions,
      technicalQuestions,
      coreSubjectQuestions,
    } = req.body;

    // console.log(req.body);

    const newMockInterview = new MockInterviewModel({
      user: userId,
      jobRole,
      overallReview,
      overallRating,
      experienceLevel,
      targetCompany,
      skills,
      dsaQuestions,
      technicalQuestions,
      coreSubjectQuestions,
    });

    const savedMockInterview = await newMockInterview.save();
    res.status(201).json(savedMockInterview);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating mock interview:", error);
    res.status(500).json({ message: "Failed to create interview" });
  }
};

// Delete a mock interview
export const deleteMockInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming user ID is set in req.user by auth middleware
    const { id } = req.params;

    const mockInterview = await MockInterviewModel.findOneAndDelete({
      _id: id,
      user: userId,
    });
    if (!mockInterview) {
      return res.status(404).json({ message: "Mock interview not found" });
    }

    res.status(200).json({ message: "Mock interview deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Edit a mock interview
export const editMockInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming user ID is set in req.user by auth middleware
    const { id } = req.params;
    const updates = req.body;

    const mockInterview = await MockInterviewModel.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true }
    );

    if (!mockInterview) {
      return res.status(404).json({ message: "Mock interview not found" });
    }

    res.status(200).json(mockInterview);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Get all mock interviews for a user
export const getMockInterviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming user ID is set in req.user by auth middleware
    const mockInterviews = await MockInterviewModel.find({ user: userId });
    res.status(200).json(mockInterviews);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Get a single mock interview by ID
export const getMockInterviewById = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id; // Assuming user ID is set in req.user by auth middleware
    const { id } = req.params;
    // console.log(id);
    const mockInterview = await MockInterviewModel.findOne({
      _id: id,
      user: userId,
    });

    if (!mockInterview) {
      return res.status(404).json({ message: "Mock interview not found" });
    }

    res.status(200).json(mockInterview);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
