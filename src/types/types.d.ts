import express from "express";

// express.Request & { userId: string },

export interface CustomRequest extends express.Request {
  userId: string;
}
