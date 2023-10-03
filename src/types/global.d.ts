import express from "express";

// express.Request & { userId: string },

declare global {
  interface CustomRequest extends express.Request {
    userId: string;
  }
}
